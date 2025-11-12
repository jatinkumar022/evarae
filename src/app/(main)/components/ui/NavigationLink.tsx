'use client';

import Link, { LinkProps } from 'next/link';
import { useNavigationStore } from '@/lib/data/mainStore/navigationStore';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';
import type { UrlObject } from 'url';

interface NavigationLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

/**
 * NavigationLink - Enhanced Link component that triggers global loader on navigation
 * Use this instead of Next.js Link for internal navigation to show loader immediately
 */
export default function NavigationLink({
  children,
  onClick,
  href,
  className,
  ...props
}: NavigationLinkProps) {
  const { setNavigating } = useNavigationStore();
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Only trigger for internal links (not external or anchor links)
    const target = e.currentTarget;
    const hrefString = typeof href === 'string' ? href : href.pathname || '';
    
    // Skip if it's an anchor link, external link, or has special modifiers
    if (
      hrefString.startsWith('#') ||
      hrefString.startsWith('http') ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      target.target === '_blank'
    ) {
      if (onClick) onClick(e);
      return;
    }

    // Prevent default to show loader first
    e.preventDefault();
    
    // Show loader immediately
    setNavigating(true);
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
    
    // Navigate after a tiny delay to ensure loader shows
    setTimeout(() => {
      // Convert UrlObject to string if needed, or use as-is for string
      if (typeof href === 'string') {
        router.push(href);
      } else {
        // For UrlObject, construct the URL string
        const urlObj = href as UrlObject;
        const path = urlObj.pathname || '';
        const query = urlObj.query;
        let url = path;
        if (query && typeof query === 'object') {
          const params = new URLSearchParams();
          Object.entries(query).forEach(([key, value]) => {
            if (value) params.append(key, String(value));
          });
          const queryString = params.toString();
          if (queryString) url += `?${queryString}`;
        }
        router.push(url);
      }
    }, 10);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

