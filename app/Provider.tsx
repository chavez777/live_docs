'use client';
import React, { ReactNode } from 'react';
import { ClientSideSuspense, LiveblocksProvider } from '@liveblocks/react/suspense';
import Loader from '@/components/Loader';
import { getClerkUsers, getDocumentUsers } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';

const Provider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser } = useUser();

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const users = await getClerkUsers({ userIds });
        return users;
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        // Safely check if clerkUser and emailAddresses exist
        if (!clerkUser || !clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
          console.error("User information is missing.");
          return [];
        }

        const roomUsers = await getDocumentUsers({
          roomId,
          currentUser: clerkUser.emailAddresses[0].emailAddress, // Now safe to access
          text,
        });

        return roomUsers;
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>{children}</ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default Provider;