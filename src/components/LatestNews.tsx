import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import studioImage from "@/assets/grace-rhythm-sounds-studio.jpg";

const LatestNews = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestNews();
  }, []);

  const loadLatestNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(9); // Show 9 featured articles on homepage (3 rows)

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error loading latest news:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return null; // Don't show section if no news
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Latest News</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest happenings at Grace Rhythm Sounds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {news.slice(0, 9).map((article, index) => (
            <Card
              key={article.id}
              className="overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {article.featured_image_url && (
                <div className="relative overflow-hidden bg-muted group">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-spring group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth"></div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : new Date(article.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                  </span>
                  {article.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {article.category}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "")}
                </p>
                <Link to={`/news/${article.slug || article.id}`}>
                  <Button variant="hero" className="w-full">
                    Read More
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/news">
            <Button variant="hero" size="lg">
              View All News
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;

