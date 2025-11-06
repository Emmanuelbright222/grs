import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const genres = ["All", "Afrobeat", "R&B", "Hip-Hop", "Pop", "Gospel", "Reggae"];

const Releases = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      const { data, error } = await supabase
        .from("releases")
        .select("*")
        .order("release_date", { ascending: false });

      if (error) throw error;
      setReleases(data || []);
    } catch (error) {
      console.error("Error loading releases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReleases =
    selectedGenre === "All"
      ? releases
      : releases.filter((release) => release.genre === selectedGenre);

  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="py-20 gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-6 animate-fade-in">
              Music Releases
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Explore our catalog of groundbreaking albums, EPs, and singles
            </p>
          </div>
        </section>

        {/* Genre Filter */}
        <section className="py-8 bg-muted/30 sticky top-20 z-40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  onClick={() => setSelectedGenre(genre)}
                  className="transition-smooth"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Releases Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : filteredReleases.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No releases found in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredReleases.map((release, index) => (
                  <Card
                    key={release.id}
                    className="group overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative">
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt={release.title}
                          className="w-full aspect-square object-cover transition-spring group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-muted flex items-center justify-center">
                          <Music className="w-24 h-24 text-muted-foreground" />
                        </div>
                      )}
                      {release.release_type && (
                        <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                          {release.release_type}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1 line-clamp-1">
                        {release.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                        {release.artist_name}
                      </p>
                      <div className="flex items-center justify-between mt-3 mb-4">
                        <span className="text-xs text-muted-foreground">
                          {release.release_date ? new Date(release.release_date).getFullYear() : ''}
                        </span>
                        {release.genre && (
                          <span className="text-xs font-medium text-accent">
                            {release.genre}
                          </span>
                        )}
                      </div>
                      
                      {/* Streaming Platform Buttons */}
                      {(() => {
                        const platforms = [
                          { url: release.spotify_url, name: "Spotify", icon: Music },
                          { url: release.apple_music_url, name: "Apple Music", icon: Music },
                          { url: release.youtube_music_url, name: "YouTube Music", icon: Youtube },
                          { url: release.audiomack_url, name: "Audiomack", icon: Music },
                          { url: release.boomplay_url, name: "Boomplay", icon: Music },
                          { url: release.streaming_url, name: "Listen", icon: Play }, // Legacy fallback
                        ].filter(p => p.url && p.url.trim() !== "");

                        if (platforms.length === 0) return null;
                        
                        return (
                          <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                              Stream Now On
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {platforms.map((platform, idx) => (
                                <a
                                  key={idx}
                                  href={platform.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="hero" size="sm" className="text-xs">
                                    <platform.icon className="mr-1.5 h-3.5 w-3.5" />
                                    {platform.name === "Listen" ? "Listen" : platform.name}
                                  </Button>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Music className="w-16 h-16 mx-auto mb-6 text-accent animate-pulse-glow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
              Follow Us on Your Favorite Platform
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay updated with all our latest releases across all streaming platforms
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music className="mr-2" />
                  Spotify
                </a>
              </Button>
              <Button variant="hero" size="lg" asChild>
                <a
                  href="https://music.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music className="mr-2" />
                  Apple Music
                </a>
              </Button>
              <Button variant="hero" size="lg" asChild>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Music className="mr-2" />
                  YouTube Music
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Releases;
