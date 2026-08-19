import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Disc,
  Video,
  Calendar,
  Newspaper,
  Building2,
  Megaphone,
  ShieldCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Globe,
  Bell,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/grace-rhythm-sounds-logo.png";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  headerActions,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("dashboard_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewingAsArtist, setViewingAsArtist] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("dashboard_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    checkUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserAndProfile();
    });

    return () => subscription.unsubscribe();
  }, [location.search]);

  const checkUserAndProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (!authUser) {
        setLoading(false);
        return;
      }

      // Check admin status
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .eq("role", "admin")
        .maybeSingle();

      const userIsAdmin = roleData?.role === "admin";
      setIsAdmin(userIsAdmin);

      // Check query params for viewing as artist
      const searchParams = new URLSearchParams(window.location.search);
      const artistIdParam = searchParams.get("artist_id");

      if (userIsAdmin && artistIdParam) {
        setViewingAsArtist(true);
        const { data: artistProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", artistIdParam)
          .maybeSingle();
        setProfile(artistProfile);
      } else {
        setViewingAsArtist(false);
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();
        setProfile(userProfile);
      }
    } catch (err) {
      console.error("Error in DashboardLayout auth check:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const adminNavItems = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Artists",
      path: "/dashboard/artists",
      icon: Users,
    },
    {
      label: "Releases",
      path: "/dashboard/releases",
      icon: Disc,
    },
    {
      label: "Videos",
      path: "/dashboard/videos",
      icon: Video,
    },
    {
      label: "Events",
      path: "/dashboard/events",
      icon: Calendar,
    },
    {
      label: "News",
      path: "/dashboard/news",
      icon: Newspaper,
    },
    {
      label: "Bank Details",
      path: "/dashboard/bank-details",
      icon: Building2,
    },
    {
      label: "Announcements",
      path: "/dashboard/announcements",
      icon: Megaphone,
    },
    {
      label: "Admin Management",
      path: "/dashboard/admin-management",
      icon: ShieldCheck,
    },
  ];

  const artistNavItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Profile",
      path: "/dashboard/profile",
      icon: User,
    },
  ];

  const navItems = isAdmin && !viewingAsArtist ? adminNavItems : artistNavItems;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Grace Rhythm Sounds" className="h-8 w-auto" />
            <span className="font-bold text-sm tracking-tight">GRS Panel</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-accent/20 text-accent rounded-full">
              Admin
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:z-30 h-screen
          bg-card/95 backdrop-blur border-r border-border/40 flex flex-col justify-between
          transition-all duration-300 ease-in-out shadow-xl md:shadow-none
          ${
            isMobileOpen
              ? "translate-x-0 w-72"
              : "-translate-x-full md:translate-x-0"
          }
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <img
              src={logo}
              alt="Grace Rhythm Sounds"
              className="h-10 w-auto flex-shrink-0"
            />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-tight">
                  Grace Rhythm
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {isAdmin && !viewingAsArtist ? "Admin Portal" : "Artist Hub"}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 mb-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
              {isAdmin && !viewingAsArtist ? "Admin Management" : "Navigation"}
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`
                  flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 group relative
                  ${
                    active
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }
                  ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}
                `}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    active ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-foreground rounded-r-full md:hidden" />
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border/40">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 mb-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
                Quick Links
              </div>
            )}
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed && !isMobileOpen ? "Public Website" : undefined}
              className={`
                flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium
                text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200
                ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}
              `}
            >
              <Globe className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Public Website</span>}
            </Link>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-border/40 bg-card/50">
          {viewingAsArtist && (!isCollapsed || isMobileOpen) && (
            <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-600 dark:text-amber-400">
              Viewing as Artist Mode
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.artist_name || "Profile"}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate leading-tight">
                    {profile?.artist_name || profile?.full_name || user?.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {isAdmin && !viewingAsArtist ? "Administrator" : "Artist Account"}
                  </span>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Viewing as Artist Banner */}
        {viewingAsArtist && (
          <div className="bg-accent/15 border-b border-accent/30 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Viewing dashboard as: <strong>{profile?.artist_name || profile?.full_name || "Artist"}</strong></span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete("artist_id");
                window.location.href = url.pathname;
              }}
              className="text-xs border-accent/40 hover:bg-accent/20"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Exit Artist View
            </Button>
          </div>
        )}

        {/* Dynamic Page Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {(title || headerActions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>}
                {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
              </div>
              {headerActions && <div className="flex flex-wrap items-center gap-2">{headerActions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
