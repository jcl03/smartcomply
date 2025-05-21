// filepath: src/app/components/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogoutController } from '@/controllers/authController';

/**
 * LogoutButton Component (View Component)
 * 
 * Traditional MVC View:
 * - Renders UI (button)
 * - Handles user interaction (click)
 * - Calls controller method for business logic
 * - Updates UI based on controller response
 */
export default function LogoutButton() {
  // View state (UI-related state only)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Handle logout click - delegates to controller
  const onLogout = async () => {
    // Update view state
    setLoading(true);
    setError(null);
    
    // Call controller (business logic) and get result
    const { error } = await handleLogoutController();
    
    // Update view based on controller response
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
