import { GetServerSideProps } from "next";
import {
  ClientSafeProvider,
  getProviders,
  signIn as signIntoProviders,
} from "next-auth/react";
import React, { FC } from "react";
import Header from "../../components/Header";

const signIn: FC<{ providers: ClientSafeProvider }> = ({ providers }) => {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center -mt-28 px-14">
        <img src="https://links.papareact.com/ocw" alt="" className="w-80" />
        <p className="text-xs italic">
          This is not a REAL app, it is built for educational purpose only
        </p>
        <div className="mt-40">
          {Object.values(providers).map((provider) => (
            <div key={provider.id}>
              <button
                className="p-3 text-white bg-blue-400 rounded-lg"
                onClick={() =>
                  signIntoProviders(provider.id, { callbackUrl: "/" })
                }
              >
                Sign in with {provider.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();

  return {
    props: { providers },
  };
};

export default signIn;
