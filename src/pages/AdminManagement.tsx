import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, X, Shield, User, Mail, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [adminList, setAdminList] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData || roleData.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    await loadAdminList();
    setLoading(false);
  };

  const loadAdminList = async () => {
    try {
      // Get all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Get emails from profiles
      const userIds = (adminRoles || []).map((r: any) => r.user_id).filter(Boolean);
      
      let profilesMap = new Map();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email")
          .in("user_id", userIds);

        if (profiles) {
          profiles.forEach((p: any) => {
            if (p.user_id) {
              profilesMap.set(p.user_id, p.email);
            }
          });
        }
      }

      // Format the data
      const formattedAdmins = (adminRoles || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        email: profilesMap.get(item.user_id) || "Unknown",
        created_at: item.created_at,
      }));

      setAdminList(formattedAdmins);
    } catch (error: any) {
      console.error("Error loading admin list:", error);
      toast({
        title: "Error",
        description: "Failed to load admin list",
        variant: "destructive",
      });
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      // Search in auth.users via a function or direct query
      // Since we can't directly query auth.users, we'll search in profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, artist_name")
        .ilike("email", `%${searchEmail.trim()}%`)
        .limit(10);

      if (profileError) throw profileError;

      if (profiles && profiles.length > 0) {
        // Check which users already have admin role
        const userIds = profiles.map(p => p.user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: existingAdmins } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("user_id", userIds)
            .eq("role", "admin");

          const adminUserIds = new Set((existingAdmins || []).map((a: any) => a.user_id));

          const resultsWithAdminStatus = profiles.map((profile: any) => ({
            ...profile,
            isAdmin: adminUserIds.has(profile.user_id),
          }));

          setSearchResults(resultsWithAdminStatus);
        } else {
          setSearchResults(profiles.map((p: any) => ({ ...p, isAdmin: false })));
        }
      } else {
        // If not found in profiles, try to create auth user (for existing users not in profiles)
        setSearchResults([]);
        toast({
          title: "User not found",
          description: "No user found with this email. They may need to sign up first.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error searching user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search user",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const promoteToAdmin = async (user: any) => {
    if (!user.user_id) {
      toast({
        title: "Error",
        description: "User ID not found. User may need to sign up first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.user_id,
          role: "admin",
        });

      if (error) {
        // Check if already admin
        if (error.code === "23505") {
          toast({
            title: "Already Admin",
            description: `${user.email} is already an admin`,
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: `${user.email} has been promoted to admin`,
        });
        await loadAdminList();
        // Refresh search results
        if (searchEmail.trim()) {
          await searchUserByEmail();
        }
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error promoting to admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  const removeAdminRole = async (adminUserId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove admin role from ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", adminUserId)
        .eq("role", "admin");

      if (error) throw error;

      toast({
        title: "Success",
        description: `${email} is no longer an admin`,
      });

      await loadAdminList();
      if (searchEmail.trim()) {
        await searchUserByEmail();
      }
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin role",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Admin Management</h1>
              <p className="text-muted-foreground">
                Manage admin users and permissions
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} variant="hero" className="w-full sm:w-auto">
              Dashboard
            </Button>
          </div>

          {/* Search User Section */}
          <Card className="p-6 border-0 shadow-soft mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Promote User to Admin
            </h2>
            <p className="text-muted-foreground mb-4">
              Search for a user by email to promote them to admin. They must have signed up first.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter user email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchUserByEmail();
                    }
                  }}
                />
              </div>
              <Button onClick={searchUserByEmail} disabled={searching} className="w-full sm:w-auto">
                {searching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="font-semibold">Search Results:</h3>
                {searchResults.map((user) => (
                  <Card key={user.user_id} className="p-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{user.email}</p>
                        {user.full_name && <p className="text-sm text-muted-foreground">{user.full_name}</p>}
                        {user.isAdmin && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Already Admin
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {!user.isAdmin ? (
                          <Button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDialogOpen(true);
                            }}
                            size="sm"
                            disabled={!user.user_id}
                            className="w-full sm:w-auto"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Promote to Admin
                          </Button>
                        ) : (
                          <Button variant="hero" size="sm" disabled className="w-full sm:w-auto opacity-50">
                            <Shield className="w-4 h-4 mr-2" />
                            Already Admin
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Admin List */}
          <Card className="p-6 border-0 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Current Admins ({adminList.length})
              </h2>
              <Button
                onClick={loadAdminList}
                variant="hero"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {adminList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No admins found</p>
            ) : (
              <div className="space-y-3">
                {adminList.map((admin) => (
                  <Card key={admin.id} className="p-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium flex items-center gap-2 truncate">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{admin.email}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Admin since {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAdminRole(admin.user_id, admin.email)}
                          title="Remove admin role"
                          className="w-full sm:w-auto"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Admin
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {selectedUser?.email} to admin? They will have full access to manage artists, releases, events, and news.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => promoteToAdmin(selectedUser)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Promote to Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminManagement;

