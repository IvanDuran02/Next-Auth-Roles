import Head from "next/head";
import { useSession, signOut, signIn } from "next-auth/react";
import { setCookie } from "cookies-next";

const Component = () => {
  const handleSignIn = async (userType) => {
    await signIn("google");
    setCookie("userType", userType);
  };
  return (
    <div>
      <button onClick={() => handleSignIn("Recruiter")}>
        Recruiter Sign In
      </button>
      <button onClick={() => handleSignIn("Talent")}>Talent Sign In</button>
    </div>
  );
};

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    console.log("Frontend Session", session.user);
    return (
      <div>
        <h1>Role: {session.user.userType}</h1>
        <h2>Name: {session.user.name}</h2>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Component />
      </main>
    </div>
  );
}
