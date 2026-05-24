'use client';

import ApolloProvider from "./ApolloProvider";
import AuthProvider from "./AuthProvider";



export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ApolloProvider>
        {children}
      </ApolloProvider>
    </AuthProvider>
  );
}