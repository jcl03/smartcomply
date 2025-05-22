"use client";

import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/supabaseClient';

export default async function UserList() {
  const supabase = createClient();
  // Fetch all user profiles from the view
  const { data: usersData, error, ...rest } = await supabase
    .from('user_profiles')
    .select('id, role, full_name, email, created_at, last_sign_in_at');

  if (error) {
    console.error('Error fetching users:', error, rest);
    return <p className="text-red-500">Failed to load users.</p>;
  }
  if (!usersData) {
    console.error('No usersData returned from Supabase');
    return <p className="text-red-500">No user data found.</p>;
  }

  return (
    <div className="bg-white shadow-md rounded my-6">
      <table className="min-w-max w-full table-auto">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Full Name</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-center">Role</th>
            <th className="py-3 px-6 text-center">Created At</th>
            <th className="py-3 px-6 text-center">Last Sign In</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {usersData.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{item.full_name}</td>
              <td className="py-3 px-6 text-left">{item.email}</td>
              <td className="py-3 px-6 text-center">{item.role}</td>
              <td className="py-3 px-6 text-center">{item.created_at}</td>
              <td className="py-3 px-6 text-center">{item.last_sign_in_at}</td>
              <td className="py-3 px-6 text-center">
                <div className="flex gap-2 justify-center">
                  <Link
                    href={`/user-management/edit/${item.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        // TODO: Implement deleteUser API call
                        const res = await fetch(`/api/user-management/delete`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: item.id }),
                        });
                        if (res.ok) {
                          window.location.reload();
                        } else {
                          alert('Failed to delete user');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
