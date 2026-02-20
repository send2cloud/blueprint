import { useState, useCallback, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ tags, onTagsChange, placeholder = 'Add tag...', className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setInputValue('');
    setIsAdding(false);
  }, [tags, onTagsChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  }, [tags, onTagsChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsAdding(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }, [inputValue, addTag, tags, removeTag]);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1.5 items-center">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs px-2 py-0.5 pr-1 flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {isAdding ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue) addTag(inputValue);
              else setIsAdding(false);
            }}
            placeholder={placeholder}
            className="h-6 w-24 text-xs px-2"
            autoFocus
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add tag
          </Button>
        )}
      </div>
    </div>
  );
}
