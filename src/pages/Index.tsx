import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedArtists from "@/components/FeaturedArtists";
import LatestReleases from "@/components/LatestReleases";
import LatestNews from "@/components/LatestNews";
import GenreMarquee from "@/components/GenreMarquee";
import MusicBackground from "@/components/MusicBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <FeaturedArtists />
        <LatestReleases />
        <LatestNews />
        <GenreMarquee />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
