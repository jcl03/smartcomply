import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-200/30 to-cyan-300/30 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-xl"></div>
        
        <Card className="relative p-8 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-18 h-18 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-all duration-300">
              <svg
                className="w-10 h-10 text-white drop-shadow-md"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
              Reset Password
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Please enter your new password below
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                New Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Input 
                  name="password" 
                  type="password"
                  placeholder="Enter your new password"
                  className="pl-12 pr-4 h-14 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-base font-medium placeholder:text-slate-400 placeholder:font-normal" 
                  required 
                  minLength={8}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400/0 via-cyan-400/0 to-blue-400/0 group-focus-within:from-sky-400/5 group-focus-within:via-cyan-400/5 group-focus-within:to-blue-400/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Input 
                  name="confirmPassword" 
                  type="password"
                  placeholder="Confirm your new password"
                  className="pl-12 pr-4 h-14 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-base font-medium placeholder:text-slate-400 placeholder:font-normal" 
                  required 
                  minLength={8}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400/0 via-cyan-400/0 to-blue-400/0 group-focus-within:from-sky-400/5 group-focus-within:via-cyan-400/5 group-focus-within:to-blue-400/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="pt-4">
              <SubmitButton 
                formAction={resetPasswordAction}
                className="w-full h-14 bg-gradient-to-r from-sky-500 via-cyan-600 to-blue-600 hover:from-sky-600 hover:via-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] text-base tracking-wide relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update Password
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </SubmitButton>
            </div>
            
            <FormMessage message={searchParams} />

            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-sky-200/50 dark:border-sky-700/50">
                <div className="flex items-center justify-center gap-2 text-sm text-sky-800 dark:text-sky-200 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Password must be at least 8 characters long
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
