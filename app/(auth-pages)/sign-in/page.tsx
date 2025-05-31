import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only redirect authenticated users to protected if their access is not revoked
  if (user && !user.user_metadata?.revoked) {
    redirect("/protected");
  }
  const searchParams = await props.searchParams;
  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-200/30 to-blue-300/30 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-blue-200/30 to-cyan-300/30 rounded-full blur-xl"></div>
      
      <Card className="relative p-8 shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-18 h-18 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-all duration-300">
            <svg
              className="w-10 h-10 text-white drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            Sign in to your account to continue
          </p>
          <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl border border-sky-200/50 dark:border-sky-700/50 shadow-inner">
            <p className="text-sm text-sky-800 dark:text-sky-200 font-semibold flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              This is an invite-only application
            </p>
          </div>
        </div>      <form className="space-y-7">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            Email address
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <Input 
              name="email" 
              type="email"
              placeholder="Enter your email address"
              className="pl-12 pr-4 h-14 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-base font-medium placeholder:text-slate-400 placeholder:font-normal" 
              required 
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400/0 via-blue-400/0 to-cyan-400/0 group-focus-within:from-sky-400/5 group-focus-within:via-blue-400/5 group-focus-within:to-cyan-400/5 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Password
            </Label>
            <Link
              className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 font-semibold hover:underline transition-all duration-200"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="pl-12 pr-4 h-14 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-base font-medium placeholder:text-slate-400 placeholder:font-normal"
              required
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400/0 via-blue-400/0 to-cyan-400/0 group-focus-within:from-sky-400/5 group-focus-within:via-blue-400/5 group-focus-within:to-cyan-400/5 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center group">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-5 w-5 text-sky-600 focus:ring-sky-500 focus:ring-2 border-2 border-slate-300 rounded-md transition-all duration-200 cursor-pointer"
            />
            <Label htmlFor="remember-me" className="ml-3 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">
              Remember me for 30 days
            </Label>
          </div>
        </div>        <div className="pt-4">
          <SubmitButton 
            pendingText="Signing in..." 
            formAction={signInAction}
            className="w-full h-14 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-600 hover:from-sky-600 hover:via-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] text-base tracking-wide relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign in to your account
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </SubmitButton>
        </div>
        
        <FormMessage message={searchParams} />

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                Need access?
              </span>
            </div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
            <span className="font-semibold text-sky-600 dark:text-sky-400">
              Contact your administrator
            </span>
            <br />
            <span className="text-sm">
              This application requires proper authorization to access
            </span>
          </p>
        </div>
      </form>
    </Card>
    </div>
  );
}
