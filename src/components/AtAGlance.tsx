import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AtAGlance = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">At A Glance</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            Grace Rhythm Sounds is a faith-driven music production and distribution platform dedicated to gospel artists. 
            We craft world-class recordings, manage digital releases, and ensure artists earn from their work while 
            reaching global audiences with spiritually resonant sound.
          </p>
          <Link to="/about">
            <Button variant="hero" size="lg" className="group">
              Learn More
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-smooth" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AtAGlance;

