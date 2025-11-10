import { Card } from "@/components/ui/card";
import peterImage from "@/assets/peter-alechenu.jpg";

const FounderSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Founder's Quote */}
        <div className="max-w-4xl mx-auto mb-16 animate-fade-in">
          <Card className="p-8 md:p-12 border-2 shadow-soft bg-gradient-to-br from-background to-muted/50">
            <div className="text-center">
              <div className="inline-block mb-6">
                
              </div>
              <blockquote className="text-xl md:text-2xl font-medium italic text-foreground mb-6 leading-relaxed">
                "Every gospel artist carries a divine sound. Grace Rhythm Sounds exists to discover it, refine it, 
                and release it to the world. Music is our ministry, excellence is our standard, and Christ is our message."
              </blockquote>
              <cite className="text-lg font-semibold text-accent not-italic">
                — Peter Alechenu Apeh
              </cite>
            </div>
          </Card>
        </div>

        {/* Meet Our Founder */}
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Founder | Peter Alechenu Apeh</h2>
          </div>
          
          <Card className="overflow-hidden border-2 shadow-strong">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative aspect-[9/16] w-full md:aspect-auto md:h-full md:min-h-[500px] bg-muted">
                <img
                  src={peterImage}
                  alt="Peter Alechenu Apeh"
                  className="w-full h-full object-cover object-center md:object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                  Peter Alechenu Apeh is a worship leader, music producer, songwriter, and preacher of the gospel 
                  whose life's work is rooted in a divine calling: to raise a sound that glorifies Christ and empowers 
                  others to do the same. With a legacy of leadership as a choir director and pastor, Peter was a key 
                  catalyst in the early 2000s music revival in Otukpo, Nigeria sparking a wave of gospel artists and 
                  producers who now minister across the globe.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                  Now based in the United Kingdom, Peter continues to pioneer faith-driven creativity through Grace 
                  Rhythm Sounds, a platform he founded to discover, mentor, and produce gospel talent. More than a 
                  music label, Grace Rhythm Sounds is a movement committed to nurturing artists, distributing their 
                  work, helping them earn, and giving them a global stage to preach Christ through music.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Peter's vision is clear: to build a spiritually grounded ecosystem where worship meets excellence, 
                  and where every song becomes a vessel of truth, healing, and transformation. Through Grace Rhythm 
                  Sounds, he invites gospel creatives to rise, be refined, and be released carrying the message of 
                  Christ to the ends of the earth.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;

