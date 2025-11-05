import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, X, Save, Calendar, Tag, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminNews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    is_featured: false,
    is_published: false,
    featured_image_url: "",
  });
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData || roleData.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    await loadNews();
    setLoading(false);
  };

  const loadNews = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading news:", error);
      toast({
        title: "Error",
        description: "Failed to load news",
        variant: "destructive",
      });
    } else {
      setNews(data || []);
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setEditingNews(null);
    setFeaturedImageFile(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      tags: "",
      is_featured: false,
      is_published: false,
      featured_image_url: "",
    });
    setIsDialogOpen(true);
  };

  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) || !fileExt || !validExtensions.includes(fileExt)) {
      return "Please upload a JPEG or PNG image file only.";
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Image size must be less than 5MB.";
    }
    
    return null;
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/news_${Date.now()}.${fileExt}`;

      // Use events bucket (or create news bucket via migration)
      const { error: uploadError } = await supabase.storage
        .from('events') // Using events bucket - you can change to 'news' if you create a separate bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('events') // Using events bucket - you can change to 'news' if you create a separate bucket
        .getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (newsItem: any) => {
    setIsEditing(true);
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title || "",
      excerpt: newsItem.excerpt || "",
      content: newsItem.content || "",
      category: newsItem.category || "",
      tags: newsItem.tags ? (Array.isArray(newsItem.tags) ? newsItem.tags.join(", ") : newsItem.tags) : "",
      is_featured: newsItem.is_featured || false,
      is_published: newsItem.is_published || false,
      featured_image_url: newsItem.featured_image_url || "",
    });
    setFeaturedImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast({
          title: "Error",
          description: "Title and content are required",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = formData.featured_image_url;
      if (featuredImageFile) {
        imageUrl = await handleImageUpload(featuredImageFile);
      }

      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Parse tags (comma-separated string to array)
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const newsData: any = {
        title: formData.title,
        slug: slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        category: formData.category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        is_featured: formData.is_featured || false,
        is_published: formData.is_published || false,
        featured_image_url: imageUrl || null,
        published_at: formData.is_published ? new Date().toISOString() : null,
        user_id: user.id,
      };

      if (isEditing && editingNews) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingNews.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "News article updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("news")
          .insert(newsData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "News article created successfully",
        });
      }

      setIsDialogOpen(false);
      await loadNews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save news article",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete news article",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "News article deleted successfully",
      });
      await loadNews();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Manage News</h1>
              <p className="text-muted-foreground">Create and manage news articles and blog posts</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create News
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="hero" className="hidden md:inline-flex">
                Back to Dashboard
              </Button>
            </div>
          </div>

          {news.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No News Articles Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first news article to get started
              </p>
              <Button onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create News
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((newsItem) => (
                <Card key={newsItem.id} className="overflow-hidden border-0 shadow-soft">
                  {newsItem.featured_image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={newsItem.featured_image_url}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {newsItem.is_featured && (
                        <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Featured</span>
                      )}
                      {newsItem.is_published ? (
                        <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Published</span>
                      ) : (
                        <span className="text-xs bg-gray-500/20 text-gray-600 px-2 py-1 rounded">Draft</span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{newsItem.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{newsItem.excerpt}</p>
                    {newsItem.category && (
                      <p className="text-xs text-accent mb-2">{newsItem.category}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleEdit(newsItem)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(newsItem.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit News Article" : "Create New News Article"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update news article information" : "Create a new news article or blog post"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Short Description (Excerpt)</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description that encourages users to read more..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content (Full Article) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your full article content here..."
                rows={12}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Full article text. You can use basic formatting with line breaks.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Artist Spotlight">Artist Spotlight</SelectItem>
                    <SelectItem value="Industry News">Industry News</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Releases">Releases</SelectItem>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="music, afrobeat, award (comma-separated)"
                />
              </div>
            </div>

            <div>
              <Label>Featured Image</Label>
              <div className="space-y-2">
                <Input
                  id="featured_image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const validationError = validateImageFile(file);
                      if (validationError) {
                        toast({
                          title: "Invalid file",
                          description: validationError,
                          variant: "destructive",
                        });
                        return;
                      }
                      setFeaturedImageFile(file);
                      setFormData({ ...formData, featured_image_url: "" });
                    }
                  }}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground">
                  JPEG or PNG only (Max 5MB). Or enter URL below.
                </p>
                {featuredImageFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {featuredImageFile.name}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Label htmlFor="featured_image_url" className="text-sm text-muted-foreground">Or enter image URL</Label>
                <Input
                  id="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, featured_image_url: e.target.value });
                    setFeaturedImageFile(null);
                  }}
                  placeholder="https://example.com/image.jpg"
                  disabled={uploadingImage || !!featuredImageFile}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Featured Article (appears on homepage "Latest News")
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked as boolean })}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Publish Now (make article visible to public)
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="hero" onClick={() => setIsDialogOpen(false)} disabled={uploadingImage} className="bg-muted text-muted-foreground hover:bg-muted/80">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={uploadingImage}>
                {uploadingImage ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update" : "Create"} Article
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminNews;

