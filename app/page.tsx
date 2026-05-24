'use client';

import {
  gql,
  useMutation,
} from '@apollo/client';

import {
  useAuth0,
} from '@auth0/auth0-react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  useEffect,
} from 'react';

const SYNC_USER = gql`
  mutation SyncUser(
    $input: LoginInput!
  ) {
    syncUser(input: $input) {
      _id
      email
      name
      profileCompleted
    }
  }
`;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    user,
    isAuthenticated,
    isLoading,
    error,
  } = useAuth0();

  const [
    syncUser,
    {
      data,
      loading,
    },
  ] = useMutation(
    SYNC_USER,
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
  ]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user
    ) {
      syncUser({
        variables: {
          input: {
            auth0Id:
              user.sub,

            email:
              user.email,

            name:
              user.name,

            picture:
              user.picture,
          },
        },
      });
    }
  }, [
    isAuthenticated,
    user,
    syncUser,
  ]);

  useEffect(() => {
    if (!data?.syncUser) return;

    const skipParam =
      searchParams?.get('skipOnboarding') === '1';
    const skipLocal =
      typeof window !== 'undefined' &&
      localStorage.getItem('skipOnboarding') === '1';

    if (!data.syncUser.profileCompleted && !skipParam && !skipLocal) {
      router.push('/onboarding');
    }
  }, [data, router]);

  console.log({
    user,
    isAuthenticated,
    isLoading,
    error,
  });

  if (isLoading) {
    return (
      <main className="p-10">
        Processing login...
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl">
        Welcome{' '}
        {
          data?.syncUser
            ?.name
        }
      </h1>

      <p className="text-sm text-gray-600">
        {data?.syncUser?.email}
      </p>

      <div className="mt-8">
        <button
          onClick={() => router.push('/create-booking')}
          className="rounded-lg bg-white border px-4 py-3 text-left shadow hover:shadow-md"
        >
          Create Booking
        </button>
      </div>
    </main>
  );
}