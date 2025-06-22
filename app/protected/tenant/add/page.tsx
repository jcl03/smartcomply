"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FolderPlus, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AddTenantPage() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    if (!name) {
      setError("Tenant name is required.");
      inputRef.current?.focus();
      return;
    }
    const { error } = await supabase.from("tenant").insert([{ name }]);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/protected/tenant");
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section - Bold gradient like Add User */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                <FolderPlus className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-3">Add New Tenant</h1>
                <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                  Register a new tenant for your organization. Each tenant represents a separate entity or client.
                </p>
              </div>
            </div>
            <Link 
              href="/protected/tenant"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tenant Management
            </Link>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Tenant Configuration</h2>
                    <p className="text-gray-600">Configure tenant details</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      ref={inputRef}
                      className="mt-1 block w-full rounded-md border-2 border-blue-400 shadow-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 text-lg px-4 py-3 transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter tenant name..."
                    />
                  </div>
                  {error && <div className="text-red-600 font-medium">{error}</div>}
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 transition-all duration-200"
                  >
                    Add Tenant
                  </button>
                </form>
              </div>
            </div>
          </div>
          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Process Steps Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tenant Registration Steps</h3>
                    <p className="text-gray-600 text-sm">Step-by-step overview</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">1</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Enter Details</p>
                      <p className="text-gray-600 text-sm leading-relaxed">Fill in the tenant name and submit the form</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">2</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Tenant Created</p>
                      <p className="text-gray-600 text-sm leading-relaxed">Tenant is added to the system and visible in the list</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">3</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Manage Tenant</p>
                      <p className="text-gray-600 text-sm leading-relaxed">Edit or remove tenants as needed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Security Features Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security Features</h3>
                    <p className="text-gray-600 text-sm">Enterprise-grade protection</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Role-based access control</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Complete audit trails</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Session management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
