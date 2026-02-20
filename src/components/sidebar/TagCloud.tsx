import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Artifact } from '../../lib/storage';

interface TagCloudProps {
  artifacts: Artifact[];
  collapsed?: boolean;
}

export function TagCloud({ artifacts, collapsed }: TagCloudProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current tag from URL if on tag page
  const currentTag = location.pathname.startsWith('/tag/') 
    ? decodeURIComponent(location.pathname.split('/tag/')[1]) 
    : null;

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    for (const artifact of artifacts) {
      if (artifact.tags) {
        for (const tag of artifact.tags) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }
    
    // Sort by count (descending), then alphabetically
    return Object.entries(counts)
      .sort(([a, countA], [b, countB]) => {
        if (countB !== countA) return countB - countA;
        return a.localeCompare(b);
      });
  }, [artifacts]);

  if (tagCounts.length === 0) {
    return null;
  }

  const handleTagClick = (tag: string) => {
    if (currentTag === tag) {
      navigate('/');
    } else {
      navigate(`/tag/${encodeURIComponent(tag)}`);
    }
  };

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <Tag className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tagCounts.map(([tag, count]) => (
        <Badge
          key={tag}
          variant={currentTag === tag ? 'default' : 'secondary'}
          className={cn(
            "cursor-pointer text-[10px] px-2 py-0.5 transition-colors",
            currentTag === tag 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent"
          )}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
          <span className="ml-1 opacity-70">{count}</span>
        </Badge>
      ))}
    </div>
  );
}
