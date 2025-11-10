import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/grace-rhythm-sounds-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[400px] max-h-[600px] sm:min-h-[500px] sm:max-h-[700px] md:min-h-[700px] md:max-h-[1000px] lg:min-h-[800px] lg:max-h-[1100px] flex items-center justify-center overflow-hidden pt-6 pb-4 sm:pt-10 sm:pb-6 md:pt-0 md:pb-0">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Grace Rhythm Sounds Artists"
          className="w-full h-full object-cover object-center"
        />
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
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 z-10 text-center relative w-full">
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 sm:mb-4 md:mb-6 text-white leading-tight px-1 sm:px-2">
            Grace Rhythm Sounds
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-5 md:mb-8 text-white font-semibold drop-shadow-lg max-w-3xl mx-auto px-1 sm:px-2">
            Helps Gospel Artists Produce and Distribute Music Globally While Earning From Their Creative Work & Preaching Christ Through Sound.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2 sm:px-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="group w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg">
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
