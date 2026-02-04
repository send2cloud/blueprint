import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Plus, Loader2, Link, Mic, Upload, Filter } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GalleryItemCard } from '@/components/tools/gallery/GalleryItemCard';
import { FileUploader } from '@/components/tools/gallery/FileUploader';
import { VoiceRecorder } from '@/components/tools/gallery/VoiceRecorder';
import { BookmarkForm } from '@/components/tools/gallery/BookmarkForm';
import { useArtifactList } from '@/hooks/useArtifact';
import { getStorageAdapter, Artifact } from '@/lib/storage';

type FilterType = 'all' | 'images' | 'audio' | 'files' | 'bookmarks';

interface GalleryItemData {
  itemType: 'media' | 'bookmark';
  mediaType?: 'image' | 'audio' | 'file';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  dataUrl?: string;
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  duration?: number;
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const { artifacts, loading, deleteArtifact, toggleFavorite, refresh } = useArtifactList('gallery');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addTab, setAddTab] = useState<'upload' | 'record' | 'bookmark'>('upload');
  const storage = getStorageAdapter();

  const filteredArtifacts = artifacts.filter(artifact => {
    if (filter === 'all') return true;
    const data = artifact.data as GalleryItemData | null;
    if (!data) return false;
    
    switch (filter) {
      case 'images':
        return data.itemType === 'media' && data.mediaType === 'image';
      case 'audio':
        return data.itemType === 'media' && data.mediaType === 'audio';
      case 'files':
        return data.itemType === 'media' && data.mediaType === 'file';
      case 'bookmarks':
        return data.itemType === 'bookmark';
      default:
        return true;
    }
  });

  const handleFileUpload = useCallback(async (file: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
    mediaType: 'image' | 'audio' | 'file';
  }) => {
    const artifact: Artifact = {
      id: uuidv4(),
      type: 'gallery',
      name: file.fileName,
      data: {
        itemType: 'media',
        mediaType: file.mediaType,
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        dataUrl: file.dataUrl,
      } as GalleryItemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
    };
    
    await storage.saveArtifact(artifact);
    await refresh();
    setSheetOpen(false);
  }, [storage, refresh]);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob, duration: number) => {
    // Convert blob to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      
      const artifact: Artifact = {
        id: uuidv4(),
        type: 'gallery',
        name: `Voice Note - ${new Date().toLocaleString()}`,
        data: {
          itemType: 'media',
          mediaType: 'audio',
          fileName: 'voice-note.webm',
          fileSize: audioBlob.size,
          mimeType: 'audio/webm',
          dataUrl,
          duration,
        } as GalleryItemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false,
      };
      
      await storage.saveArtifact(artifact);
      await refresh();
      setSheetOpen(false);
    };
    reader.readAsDataURL(audioBlob);
  }, [storage, refresh]);

  const handleBookmarkSave = useCallback(async (bookmark: {
    url: string;
    title: string;
    description?: string;
    favicon?: string;
  }) => {
    const artifact: Artifact = {
      id: uuidv4(),
      type: 'gallery',
      name: bookmark.title,
      data: {
        itemType: 'bookmark',
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description,
        favicon: bookmark.favicon,
      } as GalleryItemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
    };
    
    await storage.saveArtifact(artifact);
    await refresh();
    setSheetOpen(false);
  }, [storage, refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Gallery" icon={Image} />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Add to Gallery</SheetTitle>
              </SheetHeader>
              
              <Tabs value={addTab} onValueChange={(v) => setAddTab(v as any)} className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload" className="gap-1">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="record" className="gap-1">
                    <Mic className="h-4 w-4" />
                    Record
                  </TabsTrigger>
                  <TabsTrigger value="bookmark" className="gap-1">
                    <Link className="h-4 w-4" />
                    Bookmark
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <FileUploader onUpload={handleFileUpload} />
                </TabsContent>
                
                <TabsContent value="record" className="mt-4">
                  <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                </TabsContent>
                
                <TabsContent value="bookmark" className="mt-4">
                  <BookmarkForm onSave={handleBookmarkSave} />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>

        {filteredArtifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-medium text-foreground mb-1">
              {filter === 'all' ? 'Your gallery is empty' : `No ${filter} yet`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Add photos, voice notes, files, or bookmarks to keep your ideas organized.
            </p>
            <Button onClick={() => setSheetOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArtifacts.map((artifact) => (
              <GalleryItemCard
                key={artifact.id}
                artifact={artifact}
                onDelete={deleteArtifact}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
