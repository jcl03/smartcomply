import LogoutButtonWrapper from '../components/LogoutButtonWrapper';
import { getDashboardData } from '@/controllers/dashboardController';

/**
 * Dashboard Page (View Component)
 * 
 * Traditional MVC View:
 * - Renders UI based on data from controller
 * - Does NOT contain business logic
 * - Server Component: Pre-renders on the server
 */
export default async function DashboardPage() {
  // Get data from controller
  const dashboardData = await getDashboardData();
  
  // Render view with data from controller
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <LogoutButtonWrapper />
      <p>Welcome to your dashboard, {dashboardData.user.email}!</p>
    </div>
  );
}
