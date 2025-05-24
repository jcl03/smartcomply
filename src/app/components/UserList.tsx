"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/supabaseClient';

export default function UserList() {
  const [usersData, setUsersData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      // Fetch all user profiles from the view
      const { data, error } = await supabase
        .from('view_user_profiles')
        .select('id, role, full_name, email, created_at, last_sign_in_at');

      if (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users.');
      } else {
        setUsersData(data);
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);
  return (
    <div className="bg-white shadow-md rounded my-6">
      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && usersData && (
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
                  {!item.last_sign_in_at && (
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={async () => {
                        if (confirm('Resend activation link to this user?')) {
                          const res = await fetch('/api/user-management/resend-activation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: item.email }),
                          });
                          if (res.ok) {
                            alert('Activation link sent');
                          } else {
                            alert('Failed to resend activation');
                          }
                        }
                      }}
                    >
                      Resend Activation
                    </button>
                  )}
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
                </div>              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
      
      {!loading && !error && (!usersData || usersData.length === 0) && (
        <p className="p-4 text-center">No users found.</p>
      )}
    </div>
  );
}
