import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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

const FeaturedVideos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation(0.1);

  useEffect(() => {
    loadFeaturedVideos();
  }, []);

  const loadFeaturedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("is_featured", true)
        .order("publish_date", { ascending: false })
        .limit(3); // Max 3 featured videos

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading featured videos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section ref={ref} className={`py-20 bg-background transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no featured videos
  }

  return (
    <section ref={ref} className={`py-20 bg-background transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Youtube className="w-12 h-12 mx-auto mb-4 text-accent animate-pulse-glow" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
            Featured Videos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
            Check out our featured music videos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {videos.map((video, index) => {
            const videoId = video.youtube_video_id || extractYouTubeVideoId(video.youtube_url);
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=1` : null;
            
            return (
              <Card
                key={video.id}
                className="group overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
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

        <div className="text-center">
          <Link to="/videos">
            <Button variant="hero" size="lg">
              View All Videos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVideos;

