import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AddUserForm from '../../components/AddUserForm';

export default async function AddUserPage() {  const supabase = await createClient();

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
