import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon, Check, Loader2, Star, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/gallery/ShareButton';
import { ToolType } from '@/lib/storage';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolHeaderProps {
  title: string;
  icon: LucideIcon;
  artifactId?: string;
  artifactName?: string;
  artifactType?: ToolType;
  artifactFavorite?: boolean;
  saving?: boolean;
  onRename?: (name: string) => void;
  onToggleFavorite?: () => void;
}

export function ToolHeader({ 
  title, 
  icon: Icon, 
  artifactId, 
  artifactName, 
  artifactType,
  artifactFavorite,
  saving,
  onRename,
  onToggleFavorite,
}: ToolHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(artifactName || '');

  useEffect(() => {
    setEditValue(artifactName || '');
  }, [artifactName]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== artifactName && onRename) {
      onRename(editValue.trim());
    }
  }, [editValue, artifactName, onRename]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(artifactName || '');
      setIsEditing(false);
    }
  }, [handleBlur, artifactName]);

  const showArtifactInfo = artifactId && artifactName && artifactType;

  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        {showArtifactInfo ? (
          isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="h-7 text-lg font-semibold max-w-xs"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditing(true)}
              title="Click to rename"
            >
              {artifactName}
            </h1>
          )
        ) : (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        )}
        
        {saving && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {!saving && showArtifactInfo && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showArtifactInfo && onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="h-8 w-8"
          >
            <Star className={`h-4 w-4 ${artifactFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </Button>
        )}
        {showArtifactInfo && (
          <ShareButton artifactId={artifactId} type={artifactType} />
        )}
      </div>
    </div>
  );
}
