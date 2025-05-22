import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AddUserForm from '../../components/AddUserForm';

export default async function AddUserPage() {
  const supabase = await createClient();

  // Ensure user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/login');
  }

  // Check admin role
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();
  if (currentProfile?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <AddUserForm />
    </div>
  );
}
