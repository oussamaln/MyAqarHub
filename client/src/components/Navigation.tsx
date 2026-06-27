import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Buy", href: "/buy" },
    { label: "Rent", href: "/rent" },
    { label: "Developers", href: "/developers" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <span className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg"></div>
            MyAqarHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                {link.label}
              </span>
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/dashboard">
              <span className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                Dashboard
              </span>
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <Button
              onClick={() => logout()}
              variant="outline"
              className="text-gray-700"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </span>
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/dashboard">
              <span
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </span>
            </Link>
          )}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full text-gray-700"
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
