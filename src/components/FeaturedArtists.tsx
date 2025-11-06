import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Music, Youtube, User } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FeaturedArtists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadFeaturedArtists();
  }, []);

  const loadFeaturedArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Limit to max 9 featured artists (3 per row)
      const limitedArtists = (data || []).slice(0, 9);
      setArtists(limitedArtists);
    } catch (error) {
      console.error("Error loading featured artists:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use only dynamic artists from database (no static fallback)
  const displayArtists = artists;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animationType="fadeUp">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Artists</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the talented voices shaping the future of music
            </p>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : displayArtists.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No featured artists yet. Check back soon!
          </p>
        ) : (
          <AnimatedSection animationType="zoom" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {displayArtists.map((artist, index) => (
                <Card
                  key={artist.id || index}
                  className="group overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth max-w-sm mx-auto"
                  style={{ width: '100%', maxWidth: '400px' }}
                >
                <div className="relative overflow-hidden">
                  {artist.artist_image_url || artist.avatar_url ? (
                    <img
                      src={artist.artist_image_url || artist.avatar_url}
                      alt={artist.artist_name || artist.name || "Artist"}
                      className="w-full h-80 object-contain object-top bg-muted transition-spring group-hover:scale-105 rounded-[10px]"
                      style={{ maxWidth: '100%', width: '100%' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-80 bg-muted flex items-center justify-center">
                      <User className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-smooth"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{artist.artist_name || artist.name || "Unknown Artist"}</h3>
                  <p className="text-muted-foreground mb-4">{artist.genre || "Unknown Genre"}</p>
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
              </Card>
              ))}
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection animationType="fadeUp" delay={400}>
          <div className="text-center">
            <Link to="/artists">
              <Button variant="hero" size="lg">
                View All Artists
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>

      {/* Artist Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Artist Profile</DialogTitle>
            <DialogDescription>
              {selectedArtist && (selectedArtist.artist_name || selectedArtist.name || "Artist")} Details
            </DialogDescription>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                  {selectedArtist.artist_image_url || selectedArtist.avatar_url ? (
                    <img
                      src={selectedArtist.artist_image_url || selectedArtist.avatar_url}
                      alt={selectedArtist.artist_name || selectedArtist.name || "Artist"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedArtist.artist_name || selectedArtist.name || "Unknown Artist"}
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
    </section>
  );
};

export default FeaturedArtists;
