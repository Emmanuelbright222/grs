import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AtAGlance from "@/components/AtAGlance";
import FeaturedArtists from "@/components/FeaturedArtists";
import LatestReleases from "@/components/LatestReleases";
import FeaturedVideos from "@/components/FeaturedVideos";
import LatestNews from "@/components/LatestNews";
import FAQ from "@/components/FAQ";
import GenreMarquee from "@/components/GenreMarquee";
import MusicBackground from "@/components/MusicBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AtAGlance />
        <FeaturedArtists />
        <LatestReleases />
        <FeaturedVideos />
        <LatestNews />
        <FAQ />
        <GenreMarquee />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
