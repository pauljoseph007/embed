import { Button } from "@/components/ui/button";
import { BarChart3, Menu, X, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LoginModal } from "@/components/auth/LoginModal";
import { UserProfile } from "@/components/auth/UserProfile";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on component mount
    checkAuth();
  }, [checkAuth]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-foreground">SDX Portal</span>
              <div className="text-xs text-muted-foreground">Intelligence Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation - Only show for non-authenticated users */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </a>
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {useAuthStore.getState().user?.role === 'admin' && (
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <Link to="/admin">Dashboard Builder</Link>
                  </Button>
                )}
                <UserProfile />
              </>
            ) : (
              // Remove authentication buttons from homepage as requested
              <div></div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="md:hidden py-4 border-t border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-4">
                {!isAuthenticated && (
                  <>
                    <a
                      href="#features"
                      className="text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Features
                    </a>
                    <a
                      href="#analytics"
                      className="text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Analytics
                    </a>

                    <hr className="border-border" />
                  </>
                )}
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="justify-start text-muted-foreground">
                      <Link to="/admin">Dashboard Builder</Link>
                    </Button>
                    <div className="px-3 py-2">
                      <UserProfile />
                    </div>
                  </>
                ) : (
                  // Remove authentication buttons from mobile menu as well
                  <div></div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
};

export { Header };
export default Header;