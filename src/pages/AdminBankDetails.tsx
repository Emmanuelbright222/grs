import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, RefreshCw, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BankDetail {
  id: string;
  user_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  created_at: string;
  updated_at: string;
  profile?: {
    artist_name: string | null;
    full_name: string | null;
  };
}

const AdminBankDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);

  useEffect(() => {
    checkAuthAndLoadBankDetails();
  }, []);

  const checkAuthAndLoadBankDetails = async () => {
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

    await loadBankDetails();
    setLoading(false);
  };

  const loadBankDetails = async () => {
    try {
      // Fetch bank details
      const { data: bankData, error: bankError } = await supabase
        .from("bank_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (bankError) {
        console.error("Error loading bank details:", bankError);
        toast({
          title: "Error loading bank details",
          description: bankError.message || "Failed to load bank details",
          variant: "destructive",
        });
        return;
      }

      if (!bankData || bankData.length === 0) {
        setBankDetails([]);
        return;
      }

      // Fetch profiles for the user_ids
      const userIds = bankData.map((bd: any) => bd.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, artist_name, full_name")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        // Still set bank details even if profiles fail
        setBankDetails(bankData.map((bd: any) => ({ ...bd, profile: null })));
        return;
      }

      // Create a map of user_id to profile
      const profileMap = new Map();
      (profilesData || []).forEach((profile: any) => {
        profileMap.set(profile.user_id, profile);
      });

      // Combine bank details with profiles
      const combinedData = bankData.map((bankDetail: any) => ({
        ...bankDetail,
        profile: profileMap.get(bankDetail.user_id) || null,
      }));

      setBankDetails(combinedData);
    } catch (error: any) {
      console.error("Exception loading bank details:", error);
      toast({
        title: "Error",
        description: "Failed to load bank details",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getArtistName = (bankDetail: BankDetail) => {
    return bankDetail.profile?.artist_name || bankDetail.profile?.full_name || "Unknown";
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-8 h-8 text-accent" />
                <h1 className="text-2xl md:text-4xl font-bold">Artists Bank Details</h1>
              </div>
              <p className="text-muted-foreground">
                View all artist bank account information ({bankDetails.length} total)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button 
                onClick={async () => {
                  setLoading(true);
                  await loadBankDetails();
                  setLoading(false);
                }} 
                variant="outline"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {bankDetails.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Bank Details Yet</h3>
              <p className="text-muted-foreground">
                No artists have submitted their bank details yet.
              </p>
            </Card>
          ) : (
            <Card className="border-0 shadow-soft">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">S/N</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Artist Name</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Bank Name</TableHead>
                      <TableHead>Account No</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankDetails.map((bankDetail, index) => (
                      <TableRow key={bankDetail.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{formatDate(bankDetail.created_at)}</TableCell>
                        <TableCell className="font-medium">
                          {getArtistName(bankDetail)}
                        </TableCell>
                        <TableCell>{bankDetail.account_name}</TableCell>
                        <TableCell>{bankDetail.bank_name}</TableCell>
                        <TableCell className="font-mono">{bankDetail.account_number}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminBankDetails;

