import { Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { ToolType } from '../../lib/storage';
import { useParams } from 'react-router-dom';

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
  calendar: 'calendar',
};

export function ShareButton({ artifactId, type, className }: ShareButtonProps) {
  const { toast } = useToast();
  const { projectId: projectSlug } = useParams();

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const prefix = projectSlug ? `/${projectSlug}` : '';
    const url = `${baseUrl}${prefix}/${type}/${artifactId}`;

    const message = `Here is the link I want you to reference: ${url}\nPlease check the page source for LLM instructions (look for the "blueprint-llm" JSON block).`;

    try {
      await navigator.clipboard.writeText(message);
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
