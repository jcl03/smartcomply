"use client";

import { useState } from "react";
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Shield, 
  FileText, 
  User,
  LogOut,
  ChevronDown,
  CheckCircle,
  Folder
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
  managerOnly?: boolean;
  excludeForAdmin?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    last_sign_in_at?: string | null;
  } | null;
}

const navigation = [
  { name: "Dashboard", href: "/protected", icon: Home },
  { name: "User Management", href: "/protected/user-management", icon: Users, adminOnly: true },
  { name: "Compliance", href: "/protected/compliance", icon: Shield },
  { name: "Documents", href: "/protected/documents", icon: Folder, excludeForAdmin: true },
  { name: "Checklist Responses", href: "/protected/checklist-responses", icon: FileText, managerOnly: true },
  { name: "Audit History", href: "/protected/Audit", icon: CheckCircle, excludeForAdmin: true },
  { name: "Reports", href: "/protected/reports", icon: FileText, excludeForAdmin: true },
];

export default function DashboardLayout({ children, userProfile }: DashboardLayoutProps) {  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);  const pathname = usePathname();
  const isAdmin = userProfile?.role === 'admin';
  const isManager = userProfile?.role === 'manager';

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };  const filteredNavigation = navigation.filter(item => {
    // Show admin-only items only to admins
    if (item.adminOnly && !isAdmin) return false;
    // Show manager-only items only to managers
    if (item.managerOnly && !isManager) return false;
    // Hide excludeForAdmin items from admins
    if (item.excludeForAdmin && isAdmin) return false;
    return true;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/20"></div>
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-sky-600 hover:text-sky-900 hover:bg-sky-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/protected" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-sky-900 hidden sm:block">SmartComply</span>
            </Link>
          </div>          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-2 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors"
              >
                <div className="bg-gradient-to-br from-sky-400 to-blue-500 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{userProfile?.full_name || 'User'}</p>
                  <p className="text-xs text-sky-600">{userProfile?.role || 'Member'}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sky-200 py-1 z-50">
                  <Link href="/protected/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-sky-700 hover:bg-sky-50">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <hr className="my-1 border-sky-200" />                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-md border-r border-sky-200 shadow-lg
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-6">
            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md' 
                        : 'text-sky-700 hover:bg-sky-100 hover:text-sky-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}            </nav>

            {/* Sidebar Footer - Removed upgrade section */}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
