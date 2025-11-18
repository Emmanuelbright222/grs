import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Artists = lazy(() => import("./pages/Artists"));
const Releases = lazy(() => import("./pages/Releases"));
const Videos = lazy(() => import("./pages/Videos"));
const Events = lazy(() => import("./pages/Events"));
const News = lazy(() => import("./pages/News"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const ContractAgreement = lazy(() => import("./pages/ContractAgreement"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ArtistDashboard = lazy(() => import("./pages/ArtistDashboard"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const AdminArtists = lazy(() => import("./pages/AdminArtists"));
const AdminReleases = lazy(() => import("./pages/AdminReleases"));
const AdminVideos = lazy(() => import("./pages/AdminVideos"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const AdminNews = lazy(() => import("./pages/AdminNews"));
const AdminManagement = lazy(() => import("./pages/AdminManagement"));
const AdminBankDetails = lazy(() => import("./pages/AdminBankDetails"));
const AdminAnnouncements = lazy(() => import("./pages/AdminAnnouncements"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SpotifyCallback = lazy(() => import("./pages/SpotifyCallback"));
const AppleMusicCallback = lazy(() => import("./pages/AppleMusicCallback"));
const YouTubeCallback = lazy(() => import("./pages/YouTubeCallback"));
const AudiomackCallback = lazy(() => import("./pages/AudiomackCallback"));
const BoomplayCallback = lazy(() => import("./pages/BoomplayCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/events" element={<Events />} />
            <Route path="/news" element={<News />} />
            <Route path="/collaborate" element={<Collaborate />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contract-agreement" element={<ContractAgreement />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
            <Route path="/auth/apple-music/callback" element={<AppleMusicCallback />} />
            <Route path="/auth/youtube/callback" element={<YouTubeCallback />} />
            <Route path="/auth/audiomack/callback" element={<AudiomackCallback />} />
            <Route path="/auth/boomplay/callback" element={<BoomplayCallback />} />
            <Route path="/dashboard" element={<ArtistDashboard />} />
            <Route path="/dashboard/profile" element={<ArtistProfile />} />
            <Route path="/dashboard/artists" element={<AdminArtists />} />
            <Route path="/dashboard/releases" element={<AdminReleases />} />
            <Route path="/dashboard/videos" element={<AdminVideos />} />
            <Route path="/dashboard/events" element={<AdminEvents />} />
            <Route path="/dashboard/news" element={<AdminNews />} />
            <Route path="/dashboard/admin-management" element={<AdminManagement />} />
            <Route path="/dashboard/bank-details" element={<AdminBankDetails />} />
            <Route path="/dashboard/announcements" element={<AdminAnnouncements />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
