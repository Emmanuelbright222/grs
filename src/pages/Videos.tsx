import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Calendar, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const genres = ["All", "Afrobeat", "R&B", "Hip-Hop", "Pop", "Gospel", "Reggae"];

// Function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const Videos = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos =
    selectedGenre === "All"
      ? videos
      : videos.filter((video) => video.genre === selectedGenre);

  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="py-20 bg-navy-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-6 animate-fade-in">
              Music Videos
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Watch our latest music videos and visual content
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

        {/* Videos Grid - 3 per row */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : filteredVideos.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No videos found in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((video, index) => {
                  const videoId = video.youtube_video_id || extractYouTubeVideoId(video.youtube_url);
                  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=1` : null;
                  
                  return (
                    <Card
                      key={video.id}
                      className="group overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* YouTube Video Embed */}
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={video.song_title}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute top-0 left-0 w-full h-full bg-muted flex items-center justify-center">
                            <Youtube className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-1 line-clamp-1">
                          {video.song_title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                          {video.artist_name}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          {video.publish_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(video.publish_date).toLocaleDateString()}
                            </div>
                          )}
                          {video.genre && (
                            <span className="text-xs font-medium text-accent">
                              {video.genre}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Youtube className="w-16 h-16 mx-auto mb-6 text-accent animate-pulse-glow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
              Subscribe to Our YouTube Channel
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay updated with all our latest music videos and visual content
            </p>
            <Button variant="hero" size="lg" asChild>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="mr-2" />
                Subscribe on YouTube
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;

