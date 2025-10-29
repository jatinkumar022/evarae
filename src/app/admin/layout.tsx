import GlobalLoaderProvider from '@/app/(main)/components/layouts/GlobalLoaderProvider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalLoaderProvider>
      <main className="">{children}</main>
    </GlobalLoaderProvider>
  );
}
