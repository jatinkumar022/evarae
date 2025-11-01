'use client';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout handled by parent admin layout - this just wraps content
  return <>{children}</>;
}
