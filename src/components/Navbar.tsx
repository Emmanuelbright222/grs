import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/grace-rhythm-sounds-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [musicDropdownOpen, setMusicDropdownOpen] = useState(false);
  const [updatesDropdownOpen, setUpdatesDropdownOpen] = useState(false);
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
    path: "/collaborate",
    label: "Collaborate"
  }, {
    path: "/contact",
    label: "Contact"
  }, {
    path: "/dashboard",
    label: "Dashboard"
  }];
  return <nav className={`fixed top-0 w-full z-50 transition-smooth ${isScrolled || !isHomePage ? "bg-[#042147]/95 backdrop-blur-xl shadow-glow border-b border-[#07336b]/40" : "bg-white/10 backdrop-blur-md border-b border-white/5"}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between bg-stone-950/0">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Grace Rhythm Sounds" className="h-10 w-10 transition-spring group-hover:scale-110" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg sm:text-xl transition-smooth text-white">
                Grace Rhythm Sounds
              </span>
              <span className="text-[10px] sm:text-xs text-white/80 italic font-semibold tracking-wide">
                Connecting heaven&apos;s wavelengths
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {navLinks.filter(link => link.path !== "/dashboard").map(link => {
              const isActive = link.path === "/"
                ? location.pathname === link.path
                : location.pathname.startsWith(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-medium text-lg px-3 py-2 rounded-md transition-smooth ${
                    isActive
                      ? "text-white font-semibold bg-white/25 shadow"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Music Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMusicDropdownOpen(true)}
              onMouseLeave={() => setMusicDropdownOpen(false)}
            >
              <DropdownMenu open={musicDropdownOpen} onOpenChange={setMusicDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`relative font-medium text-lg px-3 py-2 rounded-md transition-smooth flex items-center gap-1 whitespace-nowrap ${
                      location.pathname === "/releases" || location.pathname === "/videos"
                        ? "text-white font-semibold bg-white/25 shadow"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    Music
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#042147]/95 backdrop-blur-xl border-[#07336b]/40" onMouseEnter={() => setMusicDropdownOpen(true)} onMouseLeave={() => setMusicDropdownOpen(false)}>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/releases"
                      className={`w-full text-white ${location.pathname === "/releases" ? "bg-white/10" : ""}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Releases
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/videos"
                      className={`w-full text-white ${location.pathname === "/videos" ? "bg-white/10" : ""}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Videos
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Artists Link */}
            <Link
              to="/artists"
              className={`relative font-medium text-lg px-3 py-2 rounded-md transition-smooth whitespace-nowrap ${
                location.pathname === "/artists"
                  ? "text-white font-semibold bg-white/25 shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Artists
            </Link>
            
            {/* Updates Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setUpdatesDropdownOpen(true)}
              onMouseLeave={() => setUpdatesDropdownOpen(false)}
            >
              <DropdownMenu open={updatesDropdownOpen} onOpenChange={setUpdatesDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`relative font-medium text-lg px-3 py-2 rounded-md transition-smooth flex items-center gap-1 whitespace-nowrap ${
                      location.pathname === "/events" || location.pathname === "/news"
                        ? "text-white font-semibold bg-white/25 shadow"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    Updates
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#042147]/95 backdrop-blur-xl border-[#07336b]/40" onMouseEnter={() => setUpdatesDropdownOpen(true)} onMouseLeave={() => setUpdatesDropdownOpen(false)}>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/events"
                      className={`w-full text-white ${location.pathname === "/events" ? "bg-white/10" : ""}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Events
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/news"
                      className={`w-full text-white ${location.pathname === "/news" ? "bg-white/10" : ""}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      News
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Dashboard Button - Moved to end */}
            {navLinks.filter(link => link.path === "/dashboard").map(link => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Button
                  key={link.path}
                  asChild
                  variant="hero"
                  size="lg"
                  className={`text-lg px-6 py-2 transition-smooth btn-navy-light whitespace-nowrap ${
                    isActive ? "bg-white/25 text-accent-foreground shadow-xl" : ""
                  }`}
                >
                  <Link to={link.path}>
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden transition-smooth text-white hover:text-white/80 [&>svg]:text-white [&>svg]:stroke-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
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
                        size="lg"
                        className={`w-full justify-start text-xl btn-navy-light ${location.pathname.startsWith("/dashboard") ? "bg-white/25 text-accent-foreground shadow-xl" : ""}`}
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
                      <Link to="/dashboard/videos" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/videos" ? "text-white font-bold" : "text-white"}`}>
                        Videos
                      </Link>
                      <Link to="/dashboard/events" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/events" ? "text-white font-bold" : "text-white"}`}>
                        Events
                      </Link>
                      <Link to="/dashboard/news" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/news" ? "text-white font-bold" : "text-white"}`}>
                        News
                      </Link>
                      <Link to="/dashboard/bank-details" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/bank-details" ? "text-white font-bold" : "text-white"}`}>
                        Bank Details
                      </Link>
                      <Link to="/dashboard/announcements" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/announcements" ? "text-white font-bold" : "text-white"}`}>
                        Announcements
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
                        size="lg"
                        className={`w-full justify-start text-lg btn-navy-light ${location.pathname.startsWith("/dashboard") ? "bg-white/25 text-accent-foreground shadow-xl" : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/dashboard">
                          Dashboard
                        </Link>
                      </Button>
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-xl py-2 transition-smooth hover:text-white/80 flex items-center gap-2 ${location.pathname === "/dashboard" ? "text-white font-bold" : "text-white"}`}>
                        <Bell className="w-5 h-5" />
                        Notifications
                      </Link>
                      <Link to="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-xl py-2 transition-smooth hover:text-white/80 ${location.pathname === "/dashboard/profile" ? "text-white font-bold" : "text-white"}`}>
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
                        size="lg"
                        className={`w-full justify-start text-xl btn-navy-light ${location.pathname.startsWith("/dashboard") ? "bg-white/25 text-accent-foreground shadow-xl" : ""}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link to={link.path}>
                            {link.label}
                          </Link>
                        </Button>
                      );
                    }
                    return (
                      <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-xl py-2 transition-smooth hover:text-white/80 ${location.pathname === link.path ? "text-white font-bold" : "text-white"}`}>
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="pt-2 border-t border-white/20 mt-2">
                    <p className="text-sm text-white/60 mb-2 px-2">Music</p>
                    <Link to="/releases" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 px-2 block transition-smooth hover:text-white/80 ${location.pathname === "/releases" ? "text-white font-bold" : "text-white"}`}>
                      Releases
                    </Link>
                    <Link to="/videos" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 px-2 block transition-smooth hover:text-white/80 ${location.pathname === "/videos" ? "text-white font-bold" : "text-white"}`}>
                      Videos
                    </Link>
                  </div>
                  <Link to="/artists" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-xl py-2 transition-smooth hover:text-white/80 ${location.pathname === "/artists" ? "text-white font-bold" : "text-white"}`}>
                    Artists
                  </Link>
                  <div className="pt-2 border-t border-white/20 mt-2">
                    <p className="text-sm text-white/60 mb-2 px-2">Updates</p>
                    <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 px-2 block transition-smooth hover:text-white/80 ${location.pathname === "/events" ? "text-white font-bold" : "text-white"}`}>
                      Events
                    </Link>
                    <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium text-lg py-2 px-2 block transition-smooth hover:text-white/80 ${location.pathname === "/news" ? "text-white font-bold" : "text-white"}`}>
                      News
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;