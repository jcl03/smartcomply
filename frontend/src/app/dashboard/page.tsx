''use client'';

import { useEffect, useState } from ''react'';
import { useRouter } from ''next/navigation'';
import LogoutButtonWrapper from ''../components/LogoutButtonWrapper'';
import { useAuth } from ''@/lib/auth/AuthContext'';

/**
 * Dashboard Page (View Component)
 * 
 * Client-side dashboard that uses AuthContext to get user data
 */
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace(''/auth/login'');
    }
  }, [user, loading, router]);
  
  // Show loading state
  if (loading || !user) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>;
  }
  
  // Render view with data from AuthContext
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <LogoutButtonWrapper />
      
      <div className="bg-white shadow rounded-lg p-6 mb-5">
        <h2 className="text-xl font-semibold mb-2">User Profile</h2>
        <p className="text-lg">Welcome, {user.displayName || user.email}!</p>
        <p className="text-gray-600">Role: {user.role || user.user_metadata?.role || ''user''}</p>
        <p className="text-gray-600">Email: {user.email}</p>
      </div>
      
      <div className="mt-4 flex flex-col space-y-2">
        <a href="/settings" className="text-blue-600 hover:underline">Edit Profile Settings</a>
        
        {(user.role === ''admin'' || user.user_metadata?.role === ''admin'') && (
          <a href="/admin" className="text-blue-600 hover:underline">Admin Panel</a>
        )}
      </div>
    </div>
  );
}