import { useSession, signIn, signOut } from "next-auth/react";
import useCurrentUser from "@/hooks/useCurrentUser";

const TestAuth = () => {
  const { data: session, status } = useSession();
  const { data: user, error, isLoading } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
          <p>Status: {status}</p>
          <p>Session: {session ? "Active" : "None"}</p>
          {session && (
            <div className="mt-4">
              <p>User Email: {session.user?.email}</p>
              <p>User Name: {session.user?.name}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current User API</h2>
          <p>Loading: {isLoading ? "Yes" : "No"}</p>
          <p>Error: {error ? "Yes" : "No"}</p>
          {error && <p className="text-red-400">Error: {error.message}</p>}
          {user && (
            <div className="mt-4">
              <p>User ID: {user.id}</p>
              <p>User Email: {user.email}</p>
              <p>User Name: {user.name}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            {session ? (
              <button
                onClick={() => signOut()}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
