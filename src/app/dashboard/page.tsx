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
      
      <div className="bg-white shadow rounded-lg p-6 mb-5">
        <h2 className="text-xl font-semibold mb-2">User Profile</h2>
        <p className="text-lg">Welcome, {dashboardData.user.displayName}!</p>
        <p className="text-gray-600">Role: {dashboardData.user.role}</p>
        <p className="text-gray-600">Email: {dashboardData.user.email}</p>
      </div>
      
      <div className="mt-4 flex flex-col space-y-2">
        <a href="/settings" className="text-blue-600 hover:underline">Edit Profile Settings</a>
        
        {dashboardData.user.role === 'admin' && (
          <a href="/admin" className="text-blue-600 hover:underline">Admin Panel</a>
        )}
      </div>
    </div>
  );
}
