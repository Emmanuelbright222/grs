import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import MusicBackground from "@/components/MusicBackground";
import AnimatedSection from "@/components/AnimatedSection";
import studioImage from "@/assets/studio.jpg";
import peterAlechenu from "@/assets/peter-alechenu.jpg";

const About = () => {
  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <AnimatedSection animationType="zoom">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-6xl font-bold mb-6">Our Story</h1>
                <p className="text-xl opacity-90">
                  Building bridges between cultures through the universal language of music
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <AnimatedSection animationType="slideLeft">
                <img
                  src={studioImage}
                  alt="Grace Rhythm Sounds Studio"
                  className="rounded-[10px] shadow-strong w-full"
                  loading="lazy"
                />
              </AnimatedSection>
              <AnimatedSection animationType="slideRight" delay={200}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Grace Rhythm Sounds was founded with a vision to empower artists from diverse backgrounds and genres, creating a platform where talent meets opportunity.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  We believe in the transformative power of music to connect cultures, inspire change, and create lasting impact. Our commitment is to nurture creativity while maintaining the highest standards of artistic excellence.
                </p>
                <p className="text-lg text-muted-foreground">
                  From Afrobeat to Hip-Hop, R&B to Gospel, we celebrate all genres and provide our artists with the resources, support, and global reach they need to succeed.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animationType="fadeUp">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Vision</h2>
                <p className="text-xl text-muted-foreground">
                  To become the leading global record label that champions diversity, innovation, and artistic integrity across all music genres
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <AnimatedSection animationType="zoom" delay={0}>
                <Card className="p-8 text-center border-0 shadow-soft hover:shadow-strong transition-smooth">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎵</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Artist Development</h3>
                <p className="text-muted-foreground">
                  Nurturing talent through mentorship, training, and world-class production facilities
                </p>
                </Card>
              </AnimatedSection>

              <AnimatedSection animationType="zoom" delay={100}>
                <Card className="p-8 text-center border-0 shadow-soft hover:shadow-strong transition-smooth">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌍</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Global Reach</h3>
                <p className="text-muted-foreground">
                  Connecting artists with audiences worldwide through strategic partnerships and distribution
                </p>
                </Card>
              </AnimatedSection>

              <AnimatedSection animationType="zoom" delay={200}>
                <Card className="p-8 text-center border-0 shadow-soft hover:shadow-strong transition-smooth">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  Embracing cutting-edge technology and creative approaches to music production and promotion
                </p>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <AnimatedSection animationType="fadeUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet Our Founder</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The visionary behind Grace Rhythm Sounds
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animationType="zoom" delay={200}>
              <div className="max-w-4xl mx-auto">
                <Card className="overflow-hidden border-0 shadow-strong">
                <div className="grid md:grid-cols-2 gap-0">
                  <img
                    src={peterAlechenu}
                    alt="Peter Alechenu - Founder"
                    className="w-full h-full object-contain object-top rounded-[10px]"
                    loading="lazy"
                  />
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-2">Peter Alechenu</h3>
                    <p className="text-accent font-semibold mb-4">Founder & CEO</p>
                    <p className="text-muted-foreground mb-4">
                      With over a decade of experience in the music industry, Peter Alechenu founded Grace Rhythm Sounds to create a platform that celebrates diversity and empowers artists globally.
                    </p>
                    <p className="text-muted-foreground">
                      His passion for Afrobeat culture combined with a vision for modern music production has shaped the label into a powerhouse of talent and innovation.
                    </p>
                  </div>
                </div>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
