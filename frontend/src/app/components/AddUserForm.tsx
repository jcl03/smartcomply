"use client";

import React, { useState } from 'react';
import { UserManagementAPI } from '@/lib/api';

export default function AddUserForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('authToken') || '';
      
      // Call API service directly
      await UserManagementAPI.inviteUser(email, role, token);
      
      setMessage('Invitation sent successfully!');
      setEmail('');
      setRole('user');
    } catch (err: any) {
      setError(`Failed to send invite: ${err.message}`);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Add New User</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mt-1 p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Send Invite
      </button>
    </form>
  );
}
