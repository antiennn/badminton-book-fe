'use client';

import {
  useAuth0,
} from '@auth0/auth0-react';

export default function LoginPage() {
  const {
    loginWithRedirect,
    isLoading,
  } = useAuth0();

  return (
    <main
      className="
        min-h-screen
        bg-gray-100
        flex
        items-center
        justify-center
        p-5
      "
    >
      <div
        className="
          bg-white
          w-full
          max-w-md
          rounded-2xl
          shadow-xl
          p-10
          text-center
        "
      >
        <h1
          className="
            text-4xl
            font-bold
            mb-3
          "
        >
          Badminton Booking
        </h1>

        <p
          className="
            text-black
            mb-10
          "
        >
          Find players, book courts,
          and play badminton easier.
        </p>

        <button
          disabled={isLoading}
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                connection:
                  'google-oauth2',
              },
            })
          }
          className="
            w-full
            bg-black
            text-white
            py-3
            rounded-xl
            text-lg
            font-medium
            hover:opacity-90
            transition
          "
        >
          {isLoading
            ? 'Loading...'
            : 'Continue with Google'}
        </button>

        <div
          className="
            mt-8
            text-sm
            text-black
          "
        >
          Powered by Auth0
        </div>
      </div>
    </main>
  );
}