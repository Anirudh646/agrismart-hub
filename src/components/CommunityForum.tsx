import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Loader2, MessageCircle, Plus, Send, Trash2, Users } from "lucide-react";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  crop_name: string | null;
  likes_count: number;
  created_at: string;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const categories = ["general", "crops", "pests", "market", "schemes", "weather"];

export const CommunityForum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general", crop_name: "" });

  useEffect(() => {
    void fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setIsLoading(true);
    const [postsRes, repliesRes, likesRes] = await Promise.all([
      supabase.from("forum_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("forum_replies").select("*").order("created_at", { ascending: true }),
      supabase.from("forum_post_likes").select("post_id, user_id"),
    ]);
    if (postsRes.data) setPosts(postsRes.data);
    if (repliesRes.data) setReplies(repliesRes.data);
    if (likesRes.data && user) {
      setLikedPostIds(likesRes.data.filter((l) => l.user_id === user.id).map((l) => l.post_id));
    }
    setIsLoading(false);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      category: newPost.category,
      crop_name: newPost.crop_name.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Posted", description: "Your question is now visible to other farmers." });
    setNewPost({ title: "", content: "", category: "general", crop_name: "" });
    setShowNewPost(false);
    void fetchAll();
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const liked = likedPostIds.includes(postId);
    if (liked) {
      setLikedPostIds((ids) => ids.filter((id) => id !== postId));
      setPosts((p) => p.map((x) => (x.id === postId ? { ...x, likes_count: Math.max(x.likes_count - 1, 0) } : x)));
      const { error } = await supabase.from("forum_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      if (error) toast({ title: "Could not remove like", description: error.message, variant: "destructive" });
    } else {
      setLikedPostIds((ids) => [...ids, postId]);
      setPosts((p) => p.map((x) => (x.id === postId ? { ...x, likes_count: x.likes_count + 1 } : x)));
      const { error } = await supabase.from("forum_post_likes").insert({ post_id: postId, user_id: user.id });
      if (error) toast({ title: "Could not like", description: error.message, variant: "destructive" });
    }
  };

  const handleReply = async (postId: string) => {
    const text = (replyText[postId] ?? "").trim();
    if (!user || !text) return;
    const { error } = await supabase.from("forum_replies").insert({ post_id: postId, user_id: user.id, content: text });
    if (error) {
      toast({ title: "Could not reply", description: error.message, variant: "destructive" });
      return;
    }
    setReplyText((r) => ({ ...r, [postId]: "" }));
    void fetchAll();
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from("forum_posts").delete().eq("id", postId);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    void fetchAll();
  };

  const visiblePosts = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Farmer Community
            </CardTitle>
            <CardDescription>Ask, answer and share experiences with other farmers</CardDescription>
          </div>
          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share with the community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="e.g., Yellow leaves in wheat after irrigation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Details *</Label>
                  <Textarea
                    rows={4}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Describe your situation or advice..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Crop (optional)</Label>
                    <Input
                      value={newPost.crop_name}
                      onChange={(e) => setNewPost({ ...newPost, crop_name: e.target.value })}
                      placeholder="Wheat"
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreatePost} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["all", ...categories].map((c) => (
              <Button
                key={c}
                size="sm"
                variant={filter === c ? "default" : "outline"}
                className="capitalize"
                onClick={() => setFilter(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {visiblePosts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No posts here yet. Be the first to start a discussion.
          </CardContent>
        </Card>
      )}

      {visiblePosts.map((post) => {
        const postReplies = replies.filter((r) => r.post_id === post.id);
        const liked = likedPostIds.includes(post.id);
        const isOpen = openPostId === post.id;
        return (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {post.category ?? "general"}
                    </Badge>
                    {post.crop_name && <Badge variant="outline">{post.crop_name}</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {post.user_id === user?.id ? "You" : "Farmer"} · {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {post.user_id === user?.id && (
                  <Button variant="ghost" size="icon" aria-label="Delete post" onClick={() => deletePost(post.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  aria-label={liked ? "Remove like" : "Like post"}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-destructive text-destructive" : ""}`} />
                  {post.likes_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setOpenPostId(isOpen ? null : post.id)}
                >
                  <MessageCircle className="w-4 h-4" />
                  {postReplies.length} {postReplies.length === 1 ? "Reply" : "Replies"}
                </Button>
              </div>

              {isOpen && (
                <div className="space-y-3 border-t pt-4">
                  {postReplies.map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-muted/40 p-3">
                      <p className="text-sm">{reply.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {reply.user_id === user?.id ? "You" : "Farmer"} ·{" "}
                        {new Date(reply.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={replyText[post.id] ?? ""}
                      onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                      placeholder="Write a reply..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleReply(post.id);
                      }}
                    />
                    <Button size="icon" aria-label="Send reply" onClick={() => handleReply(post.id)}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommunityForum;
