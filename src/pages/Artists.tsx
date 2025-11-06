import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Youtube, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Artists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .not("artist_name", "is", null)
        .eq("is_approved", true) // Only show approved artists
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error("Error loading artists:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="py-20 gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-6 animate-fade-in">
              Our Artists
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Meet the extraordinary talents shaping the sound of tomorrow
            </p>
          </div>
        </section>

        {/* Artists Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : artists.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No artists yet. Check back soon!
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {artists.map((artist, index) => (
                  <Card
                    key={artist.id}
                    id={(artist.artist_name || artist.full_name || "").toLowerCase().replace(/\s+/g, '-')}
                    className="overflow-hidden border-0 shadow-strong hover:shadow-glow transition-smooth animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-0">
                      <div className="relative overflow-hidden group bg-muted">
                        {artist.artist_image_url || artist.avatar_url ? (
                          <img
                            src={artist.artist_image_url || artist.avatar_url}
                            alt={artist.artist_name || artist.full_name || "Artist"}
                            className="w-full h-full object-contain object-top transition-spring group-hover:scale-105 rounded-[10px]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-24 h-24 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold mb-2">
                            {artist.artist_name || artist.full_name || "Unknown Artist"}
                          </h3>
                          <p className="text-accent font-semibold mb-6">{artist.genre || "Unknown Genre"}</p>
                        </div>
                        <div className="space-y-3">
                          <Button
                            variant="hero"
                            className="w-full"
                            onClick={() => {
                              setSelectedArtist(artist);
                              setIsDialogOpen(true);
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
              Want to Join Our Roster?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up">
              We're always looking for talented artists who share our passion for music and creativity
            </p>
            <Button variant="hero" size="lg" asChild>
              <a href="/collaborate">Submit Your Demo</a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      {/* Artist Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Artist Profile</DialogTitle>
            <DialogDescription>
              {selectedArtist && (selectedArtist.artist_name || selectedArtist.full_name || "Artist")} Details
            </DialogDescription>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                  {selectedArtist.artist_image_url || selectedArtist.avatar_url ? (
                    <img
                      src={selectedArtist.artist_image_url || selectedArtist.avatar_url}
                      alt={selectedArtist.artist_name || selectedArtist.full_name || "Artist"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedArtist.artist_name || selectedArtist.full_name || "Unknown Artist"}
                  </h2>
                  {selectedArtist.genre && (
                    <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                      {selectedArtist.genre}
                    </span>
                  )}
                </div>
              </div>

              {/* Streaming Platform Buttons */}
              {(() => {
                const platforms = [
                  { url: selectedArtist.spotify_url, name: "Spotify", icon: Music },
                  { url: selectedArtist.apple_music_url, name: "Apple Music", icon: Music },
                  { url: selectedArtist.youtube_music_url, name: "YouTube Music", icon: Youtube },
                  { url: selectedArtist.audiomack_url, name: "Audiomack", icon: Music },
                  { url: selectedArtist.boomplay_url, name: "Boomplay", icon: Music },
                ].filter(p => p.url && p.url.trim() !== "");

                if (platforms.length > 0) {
                  return (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                        Stream Now On
                      </h3>
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
                              {platform.name}
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Bio Section - Only shown after clicking View Profile */}
              {selectedArtist.bio && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedArtist.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Artists;
