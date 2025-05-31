export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 relative overflow-hidden">
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        
        {/* Enhanced floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/35 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center space-y-8 max-w-lg">
            {/* Enhanced logo with animation */}
            <div className="flex flex-col items-center mb-12">
              <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                </svg>
              </div>
              
              {/* Company name with improved typography */}
              <h1 className="text-5xl font-bold mb-4 tracking-tight drop-shadow-lg">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  SmartComply
                </span>
              </h1>
              
              {/* Tagline */}
              <p className="text-blue-100 text-lg font-medium opacity-90">
                Quality & Safety Excellence
              </p>
            </div>
            
            {/* Vision section with enhanced styling */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Our Vision</h2>
                </div>
              </div>
              
              <p className="text-white/95 leading-relaxed text-center font-medium">
                To establish a comprehensive and systematic quality and safety ecosystem by leveraging cutting-edge technology to ensure compliance with certification standards.
              </p>
            </div>
            
            {/* Additional features showcase */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-white">Certified</span>
                </div>
                <p className="text-xs text-blue-100">Industry Standards</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span className="text-sm font-medium text-white">Analytics</span>
                </div>
                <p className="text-xs text-blue-100">Real-time Insights</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
