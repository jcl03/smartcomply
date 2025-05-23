"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/supabaseClient';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, email')
        .eq('id', userId)
        .single();
      if (data) {
        setUser(data);
        setFullName(data.full_name || '');
        setRole(data.role || 'user');
        setEmail(data.email || '');
      } else {
        setMessage('User not found');
      }
    }
    if (userId) fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, role })
      .eq('id', userId);
    if (error) {
      setMessage('Failed to update user');
    } else {
      setMessage('User updated successfully!');
      setTimeout(() => router.push('/user-management'), 1200);
    }
  };

  if (!userId) return <div>User ID is missing from URL.</div>;
  if (message && message.includes('not found')) return <div>{message}</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded mt-8">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full mt-1 p-2 border rounded bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="external_auditor">External Auditor</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
