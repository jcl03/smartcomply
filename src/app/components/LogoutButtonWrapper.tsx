'use client';

import dynamic from 'next/dynamic';

// Dynamic import of LogoutButton in a client component context
const LogoutButton = dynamic(() => import('./LogoutButton'), {
  ssr: false,
  loading: () => <div>Loading logout button...</div>
});

export default function LogoutButtonWrapper() {
  return <LogoutButton />;
}
