import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isHomePage = location.pathname === "/";
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Check for email verification
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (session?.user?.email_confirmed_at) {
          // Check if we've already shown the toast for this verification
          const lastVerificationToast = localStorage.getItem('email_verification_toast_shown');
          const verificationTime = session.user.email_confirmed_at;
          
          if (lastVerificationToast !== verificationTime) {
            // Show toast and store the verification time
            localStorage.setItem('email_verification_toast_shown', verificationTime);
            toast({
              title: "Email Verified!",
              description: "Thank you for verifying your email",
            });
          }
        }
      }
      checkUser();
    });
    return () => subscription.unsubscribe();
  }, [toast]);

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);
    
    if (authUser) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .eq("role", "admin")
        .maybeSingle();
      // Always set admin status based on actual role, not viewing context
      setIsAdmin(data?.role === "admin");
    } else {
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setIsMobileMenuOpen(false);
  };
  const navLinks = [{
    path: "/",
    label: "Home"
  }, {
    path: "/about",
    label: "About"
  }, {
    path: "/artists",
    label: "Artists"
  }, {
    path: "/releases",
    label: "Releases"
  }, {
    path: "/events",
    label: "Events"
  }, {
    path: "/news",
    label: "News"
  }, {
    path: "/collaborate",
    label: "Collaborate"
  }, {
    path: "/contact",
    label: "Contact"
  }, {
    path: "/dashboard",
    label: "Dashboard"
  }];
  return <nav className={`fixed top-0 w-full z-50 transition-smooth ${isScrolled || !isHomePage ? "bg-accent/95 backdrop-blur-xl shadow-glow border-b border-accent/20" : "bg-white/10 backdrop-blur-md border-b border-white/5"}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between bg-stone-950/0">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Grace Rhythm Sounds" className="h-10 w-10 transition-spring group-hover:scale-110" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg sm:text-xl transition-smooth text-white">
                Grace Rhythm Sounds
              </span>
              <span className="text-xs sm:text-sm text-white/80 tracking-wide">
                Connecting heaven&apos;s wavelengths
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map(link => {
              if (link.path === "/dashboard") {
                return (
                  <Button
                    key={link.path}
                    asChild
                    variant="hero"
                    size="sm"
                    className="text-lg px-6 py-2"
                  >
                    <Link to={link.path}>
                      {link.label}
                    </Link>
                  </Button>
                );
              }
              return (
                    <Link key={link.path} to={link.path} className={`font-medium text-lg transition-smooth hover:text-white/80 ${location.pathname === link.path ? "text-white font-bold" : "text-white"}`}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className={`lg:hidden transition-smooth text-white hover:text-white/80`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <div className="lg:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  {isAdmin ? (
                    <>
                      <Button
                        asChild
                        variant="hero"
                        size="sm"
                        className="w-full justify-start text-lg"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // Clear any query params when navigating to dashboard
                          const url = new URL(window.location.href);
                          url.searchParams.delete('artist_id');
                          window.history.replaceState({}, '', url.pathname);
                          navigate("/dashboard", { replace: true });
                        }}
                      >
                        <Link to="/dashboard">
                          Dashboard
                        </Link>
                      </Button>
                      <Link to="/dashboard/artists" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/artists" ? "text-white font-bold" : "text-white"}`}>
                        Artists
                      </Link>
                      <Link to="/dashboard/releases" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/releases" ? "text-white font-bold" : "text-white"}`}>
                        Releases
                      </Link>
                      <Link to="/dashboard/events" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/events" ? "text-white font-bold" : "text-white"}`}>
                        Events
                      </Link>
                      <Link to="/dashboard/news" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/news" ? "text-white font-bold" : "text-white"}`}>
                        News
                      </Link>
                      <Link to="/dashboard/admin-management" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/admin-management" ? "text-white font-bold" : "text-white"}`}>
                        Admin Management
                      </Link>
                      <button onClick={handleSignOut} className={`font-medium text-lg py-2 text-left transition-smooth hover:text-white/80 text-white`}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="hero"
                        size="sm"
                        className="w-full justify-start text-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/dashboard">
                          Dashboard
                        </Link>
                      </Button>
                      <Link to="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/profile" ? "text-white font-bold" : "text-white"}`}>
                        My Profile
                      </Link>
                      <button onClick={handleSignOut} className={`font-medium text-lg py-2 text-left transition-smooth hover:text-white/80 text-white`}>
                        Sign Out
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {navLinks.map(link => {
                    if (link.path === "/dashboard") {
                      return (
                        <Button
                          key={link.path}
                          asChild
                          variant="hero"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link to={link.path}>
                            {link.label}
                          </Link>
                        </Button>
                      );
                    }
                    return (
                      <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === link.path ? "text-white font-bold" : "text-white"}`}>
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;