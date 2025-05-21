// filepath: src/app/components/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogoutController } from '@/controllers/authController';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const onLogout = async () => {
    setLoading(true);
    setError(null);
    const { error } = await handleLogoutController();
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={onLogout}
        disabled={loading}
        className="bg-red-600 text-white py-1 px-3 rounded disabled:opacity-50"
      >
        {loading ? 'Logging out…' : 'Logout'}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
