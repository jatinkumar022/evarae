'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className=" flex items-center justify-center p-4 py-20 relative overflow-hidden">
      {/* Subtle gradient circles */}

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full text-center bg-white/50 backdrop-blur-xl rounded-3xl p-10 shadow-lg border border-white/30 animate-fade-in">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-200/20 rounded-full blur-2xl" />
        {/* Elegant 404 */}
        <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 bg-clip-text text-transparent shimmer">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mt-4 mb-4 animate-slide-up delay-[0.1s]">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed animate-slide-up delay-[0.2s]">
          We couldn’t find the page you’re looking for. Let’s help you get back
          on track.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-[0.3s]">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-white/70 hover:bg-white text-gray-700 px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg border border-pink-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Search */}
        <div className="mt-8 pt-8 border-t border-pink-200/30 animate-slide-up delay-[0.4s]">
          <p className="text-sm text-gray-500 mb-3">
            Or search for something else
          </p>
          <form
            onSubmit={handleSearch}
            className="flex items-center max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-full border border-pink-200 overflow-hidden"
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-2 text-pink-600 hover:text-pink-800 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
        .delay-\[0\.1s\] {
          animation-delay: 0.1s;
        }
        .delay-\[0\.2s\] {
          animation-delay: 0.2s;
        }
        .delay-\[0\.3s\] {
          animation-delay: 0.3s;
        }
        .delay-\[0\.4s\] {
          animation-delay: 0.4s;
        }
        .shimmer {
          background-size: 400px 100%;
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
