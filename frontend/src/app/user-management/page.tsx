import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UserList from '../components/UserList';
import Link from 'next/link';

export default async function UserManagementPage() {  const supabase = await createClient();

  // Securely get the authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/auth/login');
  }

  // Check admin role using the secure user id
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userData.user.id)
    .single();
  // show currentprofile in console
  console.log('Current Profile:', currentProfile);
  if (currentProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link
          href="/user-management/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add User
        </Link>
      </div>
      <UserList />
    </div>
  );
}
