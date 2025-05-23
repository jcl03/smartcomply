// filepath: src/app/components/LogoutButton.tsx
''use client'';

import { useState } from ''react'';
import { useRouter } from ''next/navigation'';
import { useAuth } from ''@/lib/auth/AuthContext'';

/**
 * LogoutButton Component (View Component)
 * 
 * Traditional MVC View:
 * - Renders UI (button)
 * - Handles user interaction (click)
 * - Calls API service for business logic via AuthContext
 * - Updates UI based on API response
 */
export default function LogoutButton() {
  // View state (UI-related state only)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { loading, logout } = useAuth();
  
  // Handle logout click - delegates to AuthContext
  const onLogout = async () => {
    setError(null);
    
    try {
      await logout();
      router.push(''/auth/login'');
    } catch (err: any) {
      setError(err.message || ''Logout failed'');
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={onLogout}
        disabled={loading}
        className="bg-red-600 text-white py-1 px-3 rounded disabled:opacity-50"
      >
        {loading ? ''Logging out'' : ''Logout''}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}