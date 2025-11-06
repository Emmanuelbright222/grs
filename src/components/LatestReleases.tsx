import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const LatestReleases = () => {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation(0.1);

  useEffect(() => {
    loadLatestReleases();
  }, []);

  const loadLatestReleases = async () => {
    try {
      const { data, error } = await supabase
        .from("releases")
        .select("*")
        .eq("is_latest_release", true)
        .order("release_date", { ascending: false })
        .limit(9); // Max 9 releases (3 per row, 3 rows)

      if (error) throw error;
      setReleases(data || []);
    } catch (error) {
      console.error("Error loading latest releases:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section ref={ref} className={`py-20 bg-background transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Latest Releases</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fresh sounds from our talented roster
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : releases.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No latest releases yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {releases.map((release, index) => (
              <Card
                key={release.id}
                className="group overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{release.title}</h3>
                  <p className="text-muted-foreground mb-1">{release.artist_name || "Unknown Artist"}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {release.release_date ? new Date(release.release_date).getFullYear() : "Unknown"}
                  </p>
                  
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

        <div className="text-center">
          <Link to="/releases">
            <Button variant="hero" size="lg">
              View All Releases
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestReleases;
