import { notFound } from 'next/navigation';

// This catch-all route handles all unmatched routes within the (main) group
// It immediately calls notFound() which will render the (main)/not-found.tsx page
export default function NotFoundCatchAll() {
  // Call notFound() to show the custom 404 page
  // This will render the nearest not-found.tsx file, which is (main)/not-found.tsx
  notFound();
}

