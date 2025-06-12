export default function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is simplified to allow child pages like sign-in to manage their own full-screen structure and background.
  return <>{children}</>;
}
