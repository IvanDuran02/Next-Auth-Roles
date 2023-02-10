import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { wrapApiHandlerWithSentry } from "@sentry/nextjs";

function auth(req, res) {
  return NextAuth(req, res, nextAuthOptions(req, res));
}

function nextAuthOptions(req, res) {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    callbacks: {
      async session({ session, user, token }) {
        // Defaults to what user selected
        session.user.userType = req.cookies.userType;
        const client = await clientPromise;

        const db = client.db("test"); // <-- Change "test" according to database name
        const usersCollection = db.collection("users"); // <-- Change "users" according to collection name

        // Queries database for user pertaining to email logged in with.
        const existingUser = await usersCollection.findOne({
          email: session.user.email,
        });

        // If a user doesn't have a type it will add one according to what was selected from frontend.
        //
        const updateData = async () => {
          if (existingUser && !existingUser.userType) {
            // console.log("Updating users data...");
            await usersCollection.updateOne(
              { email: session.user.email },
              { $set: { userType: req.cookies.userType } }
            );

            session.user.userType = await existingUser.userType;
          } else if (existingUser && existingUser.userType) {
            // if user in database has a type return their type to frontend instead.
            // console.log("User already has a type...");
            session.user.userType = await existingUser.userType;
          }
        };

        updateData();
        return session;
      },
    },
    adapter: MongoDBAdapter(clientPromise),
  };
}
export default wrapApiHandlerWithSentry(auth);
