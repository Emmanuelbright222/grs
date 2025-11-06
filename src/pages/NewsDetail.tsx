import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      // Try to find by slug first, then by id
      let query = supabase
        .from("news")
        .select("*")
        .eq("is_published", true);

      // Check if slug is a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || "");
      
      if (isUUID) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate("/news");
        return;
      }

      setArticle(data);

      // Increment view count
      await supabase
        .from("news")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);

      // Load related articles (same category, excluding current)
      if (data.category) {
        const { data: related } = await supabase
          .from("news")
          .select("*")
          .eq("is_published", true)
          .eq("category", data.category)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(3);

        setRelatedArticles(related || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading article:", error);
      navigate("/news");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <MusicBackground />
        <Navbar />
        <main className="pt-24 pb-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="hero"
            onClick={() => navigate("/news")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>

          <article>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
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
                    <Tag className="w-4 h-4" />
                    {article.category}
                  </span>
                )}
                {article.author_name && (
                  <span>By {article.author_name}</span>
                )}
              </div>
              
              {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent/20 text-accent rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {article.featured_image_url && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              <div 
                className="text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card className="p-6 border-0 shadow-soft mt-12">
                <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/news/${related.slug || related.id}`}
                      className="block"
                    >
                      <Card className="overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth">
                        {related.featured_image_url && (
                          <div className="aspect-video bg-muted overflow-hidden">
                            <img
                              src={related.featured_image_url}
                              alt={related.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-sm mb-2 line-clamp-2">{related.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {related.excerpt || (related.content ? related.content.replace(/<[^>]*>/g, '').substring(0, 100) + "..." : "")}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;

