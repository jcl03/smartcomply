import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden bg-white">
        {/* Left Column: Branding/Info */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-sky-500 to-blue-600 text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <svg
              className="w-8 h-8 text-white drop-shadow-md"
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
          <h2 className="text-3xl font-bold mb-4 text-center">
            SmartComply
          </h2>
          <p className="text-center text-sky-100 mb-6">
            Password Recovery. Secure and simple password reset process to get you back on track.
          </p>
          <div className="mt-4 p-6 bg-white/10 rounded-xl border border-white/20 shadow-inner">
            <h3 className="text-lg font-semibold mb-2 text-center">Security First</h3>
            <p className="text-sm text-sky-50 text-center">
              We take your account security seriously. Our password reset process is designed to be both secure and user-friendly.
            </p>
          </div>
        </div>

        {/* Right Column: Reset Password Form */}
        <div className="p-8 md:p-12">
          <div className="text-center mb-6 md:mb-8">
            <div className="md:hidden mx-auto w-14 h-14 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg
                className="w-7 h-7 text-white drop-shadow-md"
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Reset your password
            </h1>
            <p className="text-slate-600 text-md">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="mt-4 p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200/50 shadow-inner">
              <p className="text-xs text-sky-800 font-semibold flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                We'll send you a secure link to reset your password
              </p>
            </div>
          </div>          <form className="space-y-6">
            <div className="space-y-2">
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

            <div className="pt-2">
              <SubmitButton 
                formAction={forgotPasswordAction}
                className="w-full h-12 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-600 hover:from-sky-600 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-sm tracking-wide relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send reset instructions
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>              </SubmitButton>
            </div>
            
            <FormMessage message={searchParams} />
            
            <div className="mt-4">
              <SmtpMessage />
            </div>

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                    Remember your password?
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-sm tracking-wide"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Back to Sign In
                </Link>
              </div>
            </div>          </form>
        </div>
      </div>
    </div>
  );
}
