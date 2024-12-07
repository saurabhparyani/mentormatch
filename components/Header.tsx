"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";
import { UserAvatar } from "@/components/UserAvatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `${
      isActive
        ? "text-indigo-600 border-b-2 border-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`;
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link
            href={user ? "/matches" : "/"}
            className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
          >
            MentorMatch
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/matches"
                  className={`${getLinkStyle("/matches")} py-1`}
                >
                  Matches
                </Link>
                <Link
                  href="/discover"
                  className={`${getLinkStyle("/discover")} py-1`}
                >
                  Discover
                </Link>
                <Link
                  href="/connections"
                  className={`${getLinkStyle("/connections")} py-1`}
                >
                  Connections
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <UserAvatar name={user.name} className="h-8 w-8" />
                </Link>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={getLinkStyle("/login")}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href="/matches"
                    className={getLinkStyle("/matches")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Matches
                  </Link>
                  <Link
                    href="/discover"
                    className={getLinkStyle("/discover")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Discover
                  </Link>
                  <Link
                    href="/connections"
                    className={getLinkStyle("/connections")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connections
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserAvatar name={user.name} className="h-8 w-8" />
                    Profile
                  </Link>
                  <NotificationBell />
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-indigo-600 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={getLinkStyle("/login")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
