"use client";

import { useRouter } from "next/navigation";
import { useSession, authClient } from "./lib/auth.client";
import { useState, useEffect } from "react";

// async function getApiData() {
//   try {
//     const res = await fetch("http://localhost:5000/api/health", {
//       cache: "no-store",
//     });
//     return res.json();
//   } catch (error) {
//     return { message: "Failed to connect to API" };
//   }
// }

export default function Page() {
  // const data = await getApiData();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL:`${process.env.NEXT_PUBLIC_DOMAIN}/` , // Where to redirect after successful login
    });
  };

  if (isPending) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p>
          Loading <span className="animate-ping">...</span>
        </p>
      </div>
    );
  }
  if (session?.session.id) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-neutral-900">
        <div className="h-100 w-100 bg-neutral-500 rounded-md flex flex-col items-center p-5 gap-4">
          <p className="text-white ">Welcome, {session!.user.name}!</p>
          <button className="bg-red-500 text-red-100 py-2 px-2 cursor-pointer hover:bg-red-600" onClick={() => authClient.signOut()}>Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex justify-center items-center bg-neutral-900">
      <div className="h-30 w-50 bg-neutral-500 rounded-md flex flex-col items-center p-5 gap-4">
        <h2 className="text-white">You Are Logged out !</h2>
        <button onClick={handleGoogleSignIn} className="py-2 px-4 text-sm rounded-full bg-black text-neutral-50 cursor-pointer hover:bg-neutral-950 ">
          Login With Google
        </button>
      </div>
    </div>
  );
}
