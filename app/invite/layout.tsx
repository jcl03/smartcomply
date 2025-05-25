import React from 'react';
import { Metadata } from 'next';

// Set metadata for all invite pages
export const metadata: Metadata = {
  title: 'SmartComply | Account Invitation',
  description: 'Complete your SmartComply account registration',
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo or branding could go here */}
        {children}
      </div>
    </div>
  );
}
