import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Mail, Users, CheckCircle, Clock } from "lucide-react";

export default function FirstTimeLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-slate-800/50 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Users className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <h1 className="text-3xl font-bold mb-2">First Time Login</h1>
              <p className="text-emerald-100 text-lg">Welcome to SmartComply</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Getting Started
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                SmartComply is an invite-only application. Follow these steps to access your account.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {/* Step 1 */}
              <Card className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-700">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-500 text-white rounded-full p-2 flex-shrink-0">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sky-900 dark:text-sky-100 mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-sky-700 dark:text-sky-300 text-sm mb-3">
                      Look for an invitation email from your administrator. This email contains a special link to complete your registration.
                    </p>
                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>Subject: "You've been invited to SmartComply"</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Step 2 */}
              <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500 text-white rounded-full p-2 flex-shrink-0">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                      Click the Invitation Link
                    </h3>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm mb-3">
                      Click the "Accept Invitation" button in your email. This will take you to a registration page where you can set up your password and complete your profile.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete your profile setup</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Step 3 */}
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 text-white rounded-full p-2 flex-shrink-0">
                    <span className="font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      Start Using SmartComply
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Once your account is set up, you can sign in using the regular login form and start managing your compliance processes.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Need Help?
                  </h4>
                  <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                    If you haven't received an invitation email or are having trouble accessing your account:
                  </p>
                  <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 text-sm space-y-1">
                    <li>Check your spam/junk email folder</li>
                    <li>Contact your administrator to resend the invitation</li>
                    <li>Ensure you're using the correct email address</li>
                    <li>Try refreshing your email and waiting a few minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
              <div className="flex-1">
                <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg">
                  <p className="text-sky-700 dark:text-sky-300 text-sm font-medium">
                    Already have your login credentials?
                  </p>
                  <Link
                    href="/sign-in"
                    className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 font-semibold text-sm hover:underline"
                  >
                    Sign in here →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
