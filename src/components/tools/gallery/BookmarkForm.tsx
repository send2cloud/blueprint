import { useState } from 'react';
import { Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BookmarkFormProps {
  onSave: (bookmark: { url: string; title: string; description?: string; favicon?: string }) => void;
}

export function BookmarkForm({ onSave }: BookmarkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const extractDomain = (urlString: string) => {
    try {
      return new URL(urlString).hostname;
    } catch {
      return '';
    }
  };

  const getFaviconUrl = (urlString: string) => {
    try {
      const domain = new URL(urlString).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return undefined;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    // Auto-fill title with domain if empty
    if (!title && value) {
      const domain = extractDomain(value);
      if (domain) {
        setTitle(domain);
      }
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    
    setLoading(true);
    
    // Ensure URL has protocol
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onSave({
      url: finalUrl,
      title: title.trim() || extractDomain(finalUrl) || 'Untitled Bookmark',
      description: description.trim() || undefined,
      favicon: getFaviconUrl(finalUrl),
    });

    // Reset form
    setUrl('');
    setTitle('');
    setDescription('');
    setLoading(false);
  };

  const isValid = url.trim().length > 0;

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Article title or description"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Notes (optional)</Label>
        <Textarea
          id="description"
          placeholder="Why did you save this? Key takeaways..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={!isValid || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Bookmark'
        )}
      </Button>
    </div>
  );
}
