import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import studioImage from "@/assets/studio.jpg";

const categories = ["All", "Artist Spotlight", "Industry News", "Events", "Releases", "Announcements"];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadNews();
  }, [selectedCategory, currentPage]);

  const loadNews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .eq("is_published", true);

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error, count } = await query
        .order("published_at", { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setNews(data || []);
      const total = count || 0;
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error("Error loading news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // Get featured article (first published article)
  const featuredArticle = news.length > 0 && currentPage === 1 ? news[0] : null;
  const displayNews = featuredArticle ? news.slice(1) : news;

  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="py-20 gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              News & Updates
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Stay informed about the latest happenings at Grace Rhythm Sounds
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article - Only on first page */}
        {featuredArticle && currentPage === 1 && (
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden border-0 shadow-strong max-w-5xl mx-auto animate-scale-in">
                <div className="grid md:grid-cols-2 gap-0">
                  {featuredArticle.featured_image_url && (
                    <div className="aspect-video md:aspect-auto bg-muted overflow-hidden">
                      <img
                        src={featuredArticle.featured_image_url}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredArticle.published_at
                          ? new Date(featuredArticle.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : new Date(featuredArticle.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                      </span>
                      {featuredArticle.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {featuredArticle.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {featuredArticle.excerpt || (featuredArticle.content ? featuredArticle.content.replace(/<[^>]*>/g, '').substring(0, 200) + "..." : "")}
                    </p>
                    <Link to={`/news/${featuredArticle.slug || featuredArticle.id}`}>
                      <Button variant="hero">Read Full Article</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* News Grid */}
        <section className={`py-20 bg-muted/30 ${featuredArticle && currentPage === 1 ? '' : 'pt-20'}`}>
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : displayNews.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No news articles found. Check back soon!
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayNews.map((article, index) => (
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
                        <h3 className="text-xl font-bold mb-3 line-clamp-2">
                          {article.title}
                        </h3>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <Button
                      variant="hero"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          size="sm"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="hero"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center border-0 shadow-strong gradient-card animate-scale-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay in the Loop
              </h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to our newsletter for exclusive updates, artist news, and event announcements
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
                />
                <Button variant="hero">Subscribe</Button>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
