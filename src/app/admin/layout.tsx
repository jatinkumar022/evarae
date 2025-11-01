"use client";

import GlobalLoaderProvider from '@/app/(main)/components/layouts/GlobalLoaderProvider';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import Backdrop from './components/Backdrop';
import React from 'react';
import { usePathname } from 'next/navigation';
import './styles/theme.css';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-[#0d0d0d] ${isLoginPage ? 'overflow-hidden' : ''}`} data-admin="true">
      {!isLoginPage && <AppSidebar />}
      {!isLoginPage && <Backdrop />}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${!isLoginPage ? mainContentMargin : ''}`}
      >
        {!isLoginPage && <AppHeader />}
        <div className={!isLoginPage ? "border border-gray-25 dark:border-[#191919d3]" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalLoaderProvider>
      <ThemeProvider>
        <SidebarProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </SidebarProvider>
      </ThemeProvider>
    </GlobalLoaderProvider>
  );
}
