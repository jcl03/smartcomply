import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Shield, Key, ArrowLeft } from "lucide-react";
import { SuccessRedirect } from "@/components/success-redirect";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import Link from "next/link";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  
  // Check if this is a success case
  const isSuccess = searchParams && "success" in searchParams;
  
  if (isSuccess) {
    // Show success state and redirect after a delay
    return (
      <DashboardLayout userProfile={currentUserProfile}>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Success Card */}
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Password Updated Successfully!
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Your password has been successfully updated. You will be redirected to the dashboard shortly.
              </p>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
                <span className="font-medium">Redirecting...</span>
              </div>
              <SuccessRedirect redirectUrl="/protected" delay={3000} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                <Key className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-3">Reset Password</h1>
                <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                  Update your account password with a secure new password to maintain account security
                </p>
              </div>
            </div>
            <Link 
              href="/protected"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reset Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Password Reset
                    </CardTitle>
                    <p className="text-gray-600">Enter your new secure password below</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <form action={resetPasswordAction} className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-gray-900 font-semibold text-base">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      name="password" 
                      type="password"
                      placeholder="Enter your new password"
                      className="h-14 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 rounded-xl px-4 text-gray-900 placeholder:text-gray-400 text-base transition-all duration-200"
                      required 
                      minLength={8}
                    />
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <p>Password must be at least 8 characters long</p>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold text-base">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      name="confirmPassword" 
                      type="password"
                      placeholder="Confirm your new password"
                      className="h-14 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 rounded-xl px-4 text-gray-900 placeholder:text-gray-400 text-base transition-all duration-200"
                      required 
                      minLength={8}
                    />
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <p>Re-enter your password to confirm</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <SubmitButton className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base">
                      Update Password
                    </SubmitButton>
                  </div>
                  
                  <FormMessage message={searchParams} />
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Security Tips Card */}
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Security Tips
                    </CardTitle>
                    <p className="text-gray-600 text-sm">Keep your account secure</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Strong Password</p>
                      <p className="text-gray-600 text-sm">Use at least 8 characters with mixed case, numbers, and symbols</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Unique Password</p>
                      <p className="text-gray-600 text-sm">Don't reuse passwords from other accounts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Keep It Safe</p>
                      <p className="text-gray-600 text-sm">Don't share your password with anyone</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
