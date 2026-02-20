import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Star, 
  Settings, 
  HelpCircle,
  Home,
  Network,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './ui/command';
import { useAllArtifacts } from '../hooks/useArtifacts';
import { TOOL_LIST, TOOL_CONFIG } from '../lib/toolConfig';
import { useBlueprint } from '../contexts/BlueprintContext';
import { formatRelative } from '../lib/formatters';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { artifacts } = useAllArtifacts();
  const { isToolEnabled } = useBlueprint();
  const [search, setSearch] = useState('');

  // Filter artifacts based on search
  const filteredArtifacts = useMemo(() => {
    if (!search.trim()) return artifacts.slice(0, 8);
    const query = search.toLowerCase();
    return artifacts
      .filter((a) => a.name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [artifacts, search]);

  // Get enabled tools
  const enabledTools = useMemo(() => 
    TOOL_LIST.filter((t) => isToolEnabled(t.type)),
    [isToolEnabled]
  );

  const runCommand = useCallback((callback: () => void) => {
    onOpenChange(false);
    callback();
  }, [onOpenChange]);

  // Reset search when closed
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search artifacts, create new, or navigate..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Go to Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/favorites'))}>
            <Star className="mr-2 h-4 w-4" />
            <span>View Favorites</span>
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/relationships'))}>
            <Network className="mr-2 h-4 w-4" />
            <span>Relationship Graph</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/help'))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Create New */}
        <CommandGroup heading="Create New">
          {enabledTools.filter(t => !t.singular).map((tool) => {
            const Icon = tool.icon;
            return (
              <CommandItem 
                key={tool.type}
                onSelect={() => runCommand(() => navigate(`${tool.path}/new`))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>New {tool.title}</span>
                <CommandShortcut>{tool.shortcut}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigate to Tools */}
        <CommandGroup heading="Tools">
          {enabledTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <CommandItem 
                key={tool.type}
                onSelect={() => runCommand(() => navigate(tool.path))}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{tool.title}</span>
                <CommandShortcut>{tool.shortcut}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Recent/Search Results */}
        {filteredArtifacts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={search.trim() ? "Search Results" : "Recent Artifacts"}>
              {filteredArtifacts.map((artifact) => {
                const tool = TOOL_CONFIG[artifact.type];
                const Icon = tool.icon;
                return (
                  <CommandItem 
                    key={artifact.id}
                    onSelect={() => runCommand(() => navigate(`${tool.path}/${artifact.id}`))}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{artifact.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(artifact.updatedAt)}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
