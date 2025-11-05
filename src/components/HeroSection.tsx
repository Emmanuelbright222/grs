import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-artists.mp4";
import heroImage from "@/assets/hero-artists.jpg";
import heroArtistsPng from "@/assets/hero-artist.png";

// Toggle between video and image background
// Set to false to use static image instead
const USE_VIDEO_BACKGROUND = true;

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {USE_VIDEO_BACKGROUND ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster={heroImage} // Fallback image while video loads
          >
            <source src={heroVideo} type="video/mp4" />
            {/* Fallback to image if video fails to load */}
            <img
              src={heroImage}
              alt="Grace Rhythm Sounds Artists"
              className="w-full h-full object-cover"
            />
          </video>
        ) : (
          <img
            src={heroArtistsPng}
            alt="Grace Rhythm Sounds Artists"
            className="w-full h-full object-cover"
          />
        )}
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 gradient-overlay"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white leading-tight px-4">
            GSR | Empowering Global Rhythms
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 font-light">
          Inspiring souls through gospel music, uplifting melodies, and divine rhythms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/artists">
              <Button variant="hero" size="lg" className="group">
                Explore Artists
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
            <Link to="/releases">
              <Button variant="hero" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-primary">
                Latest Releases
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
