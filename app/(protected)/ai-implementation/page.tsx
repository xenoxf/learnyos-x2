'use client'

import React, { useState } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Copy, Check, Sparkles, Loader, Lightbulb } from 'lucide-react';
import { PremiumMarkdown } from '@/components/PremiumMarkdown';
import styles from '@/styles/ai-implementation.module.css';

export default function AIImplementationPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b-32768');
  const { toast } = useToast();

  const models = [
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', desc: 'Rápido y equilibrado' },
    { id: 'llama-2-70b-4096', name: 'Llama 2 70B', desc: 'Preciso y detallado' },
  ];

  const promptSuggestions = [
    'Explícame el teorema de Pitágoras',
    'Crea un plan de estudio para 30 días',
    'Resume la Guerra de Independencia',
    'Escribe código Python para calcular números primos',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa un prompt para generar contenido',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.generateWithGroq(prompt, selectedModel);
      setResponse(result.text || result || 'Sin respuesta');
      toast({
        title: '¡Generación completada!',
        description: 'El contenido ha sido generado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al generar contenido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado',
      description: 'Respuesta copiada al portapapeles',
    });
  };

  const handleSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>
          <Sparkles className="w-6 h-6 inline mr-2" />
          Generador IA Avanzado
        </h1>
        <p className={styles.description}>
          Genera contenido educativo usando inteligencia artificial
        </p>
      </section>

      <div className={styles.contentWrapper}>
        {/* Model Selection */}
        <Card className="p-4 mb-6">
          <p className="text-sm font-medium mb-3">Modelo de IA</p>
          <div className="grid grid-cols-2 gap-3">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary'
                }`}
                disabled={loading}
              >
                <p className="font-medium text-sm">{model.name}</p>
                <p className="text-xs text-muted-foreground">{model.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Prompt Input */}
        <Card className="p-6 space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Tu prompt</label>
              <span className="text-xs text-muted-foreground">{prompt.length} caracteres</span>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe qué deseas que genere la IA..."
              className={styles.textarea}
              rows={6}
              disabled={loading}
            />
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Sugerencias rápidas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {promptSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-left text-xs p-2 rounded border border-muted hover:border-primary hover:bg-primary/5 transition-all"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            size="lg"
            className={styles.generateButton}
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Contenido
              </>
            )}
          </Button>
        </Card>

        {/* Response Output */}
        {response && (
          <Card className={styles.outputCard}>
            <div className={styles.outputHeader}>
              <label className={styles.label}>Respuesta de la IA</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={styles.copyButton}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <div className={styles.responseContent}>
              <PremiumMarkdown
                content={response}
                filename="respuesta-ia.md"
                showExportButtons={true}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
