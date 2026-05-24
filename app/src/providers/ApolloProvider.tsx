'use client';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';

import { setContext }
from '@apollo/client/link/context';

import {
  useAuth0,
} from '@auth0/auth0-react';

function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    getAccessTokenSilently,
  } = useAuth0();

  const httpLink =
    createHttpLink({
      uri:
        process.env
          .NEXT_PUBLIC_GRAPHQL_URL,
    });

  const authLink = setContext(
    async (_, { headers }) => {

      try {
        const token =
          await getAccessTokenSilently();

        return {
          headers: {
            ...headers,

            Authorization:
              `Bearer ${token}`,
          },
        };
      } catch {
        return {
          headers,
        };
      }
    },
  );

  const client =
    new ApolloClient({
      link:
        authLink.concat(httpLink),

      cache:
        new InMemoryCache(),
    });

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default ApolloWrapper;