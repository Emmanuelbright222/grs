import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto text-white">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-9xl font-bold mb-4">404</h1>
          <div className="text-4xl md:text-5xl font-bold mb-6">
            This Beat Didn't Drop
          </div>
          <p className="text-xl opacity-90 mb-8">
            Page not found — looks like this track hasn't been released yet
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
          <Link to="/">
            <Button variant="hero" size="lg" className="group">
              <Home className="mr-2 group-hover:scale-110 transition-smooth" />
              Back to Home
            </Button>
          </Link>
          <Button
            variant="hero"
            size="lg"
            onClick={() => window.history.back()}
            className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary"
          >
            <ArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
