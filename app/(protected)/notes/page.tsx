"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, FileText, Plus, Search, Calendar, Sparkles, X, BookOpen, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [topic, setTopic] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generateMode, setGenerateMode] = useState<'topic' | 'reference'>('topic');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getNotes();
        setNotes(data || []);
      } catch (err: any) {
        console.error('Error loading notes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

  const handleGenerate = async () => {
    const content = generateMode === 'topic' ? topic : referenceText;
    if (!content.trim()) {
      toast({ title: 'Error', description: 'Ingresa contenido', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const note = await apiService.generateNote(generateMode === 'topic' ? { topic } : { referenceText });
      if (note) {
        setNotes(prev => [note, ...prev]);
        setSelectedNote(note);
        setTopic('');
        setReferenceText('');
        setSheetOpen(false);
        toast({ title: 'Nota generada exitosamente' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    try {
      await apiService.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      toast({ title: 'Nota eliminada' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-emerald-600" />
          </div>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">Notas</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 pl-9 h-9 bg-muted/50 border-border/50"
            />
          </div>
          
          {/* New Note Button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Nota</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 p-0">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Generar Nota</h2>
                  <p className="text-sm text-muted-foreground mt-1">Crea una nota con IA</p>
                </div>

                <div className="flex rounded-lg bg-muted/50 p-1">
                  <button
                    onClick={() => setGenerateMode('topic')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                      generateMode === 'topic' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Por Tema
                  </button>
                  <button
                    onClick={() => setGenerateMode('reference')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                      generateMode === 'reference' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Por Texto
                  </button>
                </div>

                {generateMode === 'topic' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tema</label>
                    <Input
                      placeholder="Ej: Fotosíntesis, Segunda Guerra Mundial..."
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Texto de referencia</label>
                    <Textarea
                      placeholder="Pega el texto que quieres resumir..."
                      value={referenceText}
                      onChange={e => setReferenceText(e.target.value)}
                      className="min-h-[200px] resize-none"
                      disabled={isGenerating}
                    />
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !(generateMode === 'topic' ? topic : referenceText).trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar Nota
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Notes List - Sidebar */}
        <div className={cn(
          "border-r border-border bg-muted/30 flex-col",
          selectedNote ? "hidden md:flex w-80 lg:w-96" : "flex w-full md:w-80 lg:w-96"
        )}>
          {/* Mobile Search */}
          <div className="p-3 border-b border-border md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? 'No se encontraron notas' : 'No hay notas aún'}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="link"
                      onClick={() => setSheetOpen(true)}
                      className="text-emerald-600 mt-2"
                    >
                      Crear primera nota
                    </Button>
                  )}
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-all group",
                      selectedNote?.id === note.id
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-background hover:bg-muted/80 border border-transparent'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-foreground line-clamp-1">{note.title}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 -mr-1 -mt-1"
                        onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{note.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Note Content */}
        {selectedNote ? (
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            {/* Note Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedNote(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="font-medium text-foreground truncate">{selectedNote.title}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(selectedNote.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>

            {/* Note Body */}
            <ScrollArea className="flex-1">
              <div className="p-6 lg:p-10 max-w-4xl">
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedNote.content}
                  </p>
                </article>
                
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Etiquetas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted/10">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-lg text-muted-foreground">Selecciona una nota</p>
              <p className="text-sm text-muted-foreground/70 mt-1">o crea una nueva</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;