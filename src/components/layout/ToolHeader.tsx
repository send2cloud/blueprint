import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon, Check, Loader2, Star, X, ChevronLeft, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/gallery/ShareButton';
import { TagInput } from '@/components/tags/TagInput';
import { ToolType } from '@/lib/storage';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ToolHeaderProps {
  title: string;
  icon: LucideIcon;
  artifactId?: string;
  artifactName?: string;
  artifactType?: ToolType;
  artifactFavorite?: boolean;
  artifactTags?: string[];
  saving?: boolean;
  onRename?: (name: string) => void;
  onToggleFavorite?: () => void;
  onUpdateTags?: (tags: string[]) => void;
  headerActions?: ReactNode;
}

export function ToolHeader({ 
  title, 
  icon: Icon, 
  artifactId, 
  artifactName, 
  artifactType,
  artifactFavorite,
  artifactTags = [],
  saving,
  onRename,
  onToggleFavorite,
  onUpdateTags,
  headerActions,
}: ToolHeaderProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(artifactName || '');
  const [tagsOpen, setTagsOpen] = useState(false);

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
  const galleryPath = artifactType ? TOOL_CONFIG[artifactType].path : '/';

  const handleBack = () => {
    navigate(galleryPath);
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Back to gallery</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted rounded">G</kbd>
          </TooltipContent>
        </Tooltip>
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
        {headerActions}
        {showArtifactInfo && onUpdateTags && (
          <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5"
              >
                <Tag className="h-4 w-4" />
                {artifactTags.length > 0 && (
                  <span className="text-xs">{artifactTags.length}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tags</h4>
                <TagInput
                  tags={artifactTags}
                  onTagsChange={onUpdateTags}
                  placeholder="Add tag..."
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Close to home</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
