import { signOut, useSession } from "next-auth/react";
import React from "react";

const MiniProfile = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between ml-10 mt-14">
      <img
        src={session?.user?.image!}
        alt=""
        className="rounded-full border p-[2px] w-16 h-16"
      />

      <div className="flex-1 mx-4">
        <h2 className="font-bold">{session?.user.username}</h2>
        <h3 className="text-sm text-gray-400">welcome to instagram</h3>
      </div>

      <button
        onClick={() => signOut()}
        className="text-sm font-bold text-blue-400"
      >
        Sign Out
      </button>
    </div>
  );
};

export default MiniProfile;
