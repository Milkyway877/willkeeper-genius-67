
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { X, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

export function Navbar({ isAuthenticated = false, onMenuToggle }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none lg:hidden"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
              <Link to="/">
                <Logo color="primary" className="h-8 w-auto" />
              </Link>
            </div>

            <div className="hidden md:ml-6 md:flex md:space-x-4 md:items-center">
              {!isAuthenticated ? (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium",
                        isActive
                          ? "text-willtank-700 border-b-2 border-willtank-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/features"
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium",
                        isActive
                          ? "text-willtank-700 border-b-2 border-willtank-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    Features
                  </NavLink>
                  <NavLink
                    to="/pricing"
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium",
                        isActive
                          ? "text-willtank-700 border-b-2 border-willtank-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    Pricing
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium",
                        isActive
                          ? "text-willtank-700 border-b-2 border-willtank-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/wills"
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium",
                        isActive
                          ? "text-willtank-700 border-b-2 border-willtank-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    My Wills
                  </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {!isAuthenticated ? (
              <>
                <NavLink to="/auth/signin">
                  <Button variant="ghost" className="mr-2">
                    Sign In
                  </Button>
                </NavLink>
                <NavLink to="/auth/signup">
                  <Button>Get Started</Button>
                </NavLink>
              </>
            ) : (
              <div className="ml-4 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 pb-3 pt-2">
          <div className="space-y-1 px-2">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive
                        ? "bg-willtank-50 text-willtank-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/features"
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive
                        ? "bg-willtank-50 text-willtank-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )
                  }
                >
                  Features
                </NavLink>
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive
                        ? "bg-willtank-50 text-willtank-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )
                  }
                >
                  Pricing
                </NavLink>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
                    <NavLink
                      to="/auth/signin"
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Sign In
                    </NavLink>
                    <NavLink
                      to="/auth/signup"
                      className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-willtank-600 hover:bg-willtank-700 rounded-md"
                    >
                      Get Started
                    </NavLink>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive
                        ? "bg-willtank-50 text-willtank-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/wills"
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive
                        ? "bg-willtank-50 text-willtank-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )
                  }
                >
                  My Wills
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
