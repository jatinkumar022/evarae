"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  Package,
  Folder,
  Grid3x3,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "Products",
    path: "/admin/products",
  },
  {
    icon: <Folder className="w-5 h-5" />,
    name: "Categories",
    path: "/admin/categories",
  },
  {
    icon: <Grid3x3 className="w-5 h-5" />,
    name: "Collections",
    path: "/admin/collections",
  },
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    name: "Orders",
    path: "/admin/orders",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Customers",
    path: "/admin/customers",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    name: "Analytics",
    path: "/admin/analytics",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    name: "Settings",
    path: "/admin/settings",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback(
    (path: string) => {
      if (!pathname) return false;
      // Dashboard should only be active if exactly on /admin
      if (path === "/admin") {
        return pathname === "/admin" || pathname === "/admin/";
      }
      return pathname.startsWith(path);
    },
    [pathname]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav) => {
        const active = isActive(nav.path);
        return (
          <li key={nav.path}>
            <Link
              href={nav.path}
              className={`menu-item group ${
                active ? "menu-item-active" : "menu-item-inactive"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  active
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 px-4 bg-white dark:bg-[#0a0a0a] text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/admin">
          {(isExpanded || isHovered || isMobileOpen) ? (
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Caelvi Admin
              </span>
          ) : (
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              C
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto h-[calc(100vh-90px)] duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 dark:text-[#696969] ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <span className="w-4 h-4">⋯</span>
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 dark:text-[#696969] ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <span className="w-4 h-4">⋯</span>
                )}
              </h2>
              {renderMenuItems(othersItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
