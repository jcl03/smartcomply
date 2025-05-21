import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import LogoutButtonWrapper from '../components/LogoutButtonWrapper';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <LogoutButtonWrapper />
      <p>Welcome to your dashboard!</p>
    </div>
  );
}
