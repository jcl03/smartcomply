export default function InviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full max-w-5xl flex justify-center p-3 px-5">
        <h1 className="font-bold text-2xl">SmartComply</h1>
      </div>
      <div className="animate-in flex-1 flex flex-col gap-10 opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6 items-center">
          {children}
        </main>
      </div>
    </div>
  )
}
