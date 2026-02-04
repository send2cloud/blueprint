import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToolType } from '@/lib/storage';

interface ShareButtonProps {
  artifactId: string;
  type: ToolType;
  className?: string;
}

const TYPE_LABELS: Record<ToolType, string> = {
  canvas: 'canvas',
  diagram: 'diagram',
  board: 'board',
  notes: 'note',
  gallery: 'gallery item',
};

export function ShareButton({ artifactId, type, className }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/${type}/${artifactId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: `Share this link to show your ${TYPE_LABELS[type]}.`,
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL from the address bar.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      <Share2 className="h-4 w-4 mr-1" />
      Share
    </Button>
  );
}
