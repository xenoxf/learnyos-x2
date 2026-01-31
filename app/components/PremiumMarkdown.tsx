'use client';

import React, { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { useContentTransformer } from '@/hooks/useContentTransformer';

interface PremiumMarkdownProps {
  content: string;
  filename?: string;
  showExportButtons?: boolean;
  className?: string;
}

export function PremiumMarkdown({
  content,
  filename = 'contenido.md',
  showExportButtons = true,
  className = '',
}: PremiumMarkdownProps) {
  const { exportMarkdown, copyToClipboard } = useContentTransformer();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    exportMarkdown(content, filename);
  };

  return (
    <div className={`premium-markdown ${className}`}>
      {/* Header con acciones */}
      {showExportButtons && (
        <div className="markdown-actions">
          <button
            onClick={handleCopy}
            className="action-btn copy-btn"
            title="Copiar al portapapeles"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="action-btn download-btn"
            title="Descargar como archivo"
          >
            <Download size={16} />
            <span>Descargar</span>
          </button>
        </div>
      )}

      {/* Contenido Markdown formateado */}
      <div className="markdown-content">
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}

/**
 * Renderiza contenido Markdown
 */
function MarkdownContent({ content }: { content: string }) {
  // Parser simple de Markdown
  const parseMarkdown = (md: string) => {
    return md
      .split('\n\n')
      .map((paragraph, idx) => {
        // Headers
        if (paragraph.startsWith('# ')) {
          return (
            <h1 key={idx} className="md-h1">
              {paragraph.replace(/^# /, '')}
            </h1>
          );
        }
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={idx} className="md-h2">
              {paragraph.replace(/^## /, '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={idx} className="md-h3">
              {paragraph.replace(/^### /, '')}
            </h3>
          );
        }

        // Blockquote
        if (paragraph.startsWith('> ')) {
          return (
            <blockquote key={idx} className="md-blockquote">
              {paragraph.replace(/^> /, '')}
            </blockquote>
          );
        }

        // Listas
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').filter((line) => line.trim());
          return (
            <ul key={idx} className="md-list">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^[-*] /, '')}</li>
              ))}
            </ul>
          );
        }

        // Código
        if (paragraph.startsWith('```')) {
          const codeMatch = paragraph.match(/```([\s\S]*?)```/);
          if (codeMatch) {
            return (
              <pre key={idx} className="md-code">
                <code>{codeMatch[1].trim()}</code>
              </pre>
            );
          }
        }

        // Tabla
        if (paragraph.includes('|')) {
          const lines = paragraph.split('\n');
          if (lines.length > 1 && lines[1].includes('---')) {
            return (
              <table key={idx} className="md-table">
                <tbody>
                  {lines
                    .filter((line) => !line.includes('---'))
                    .map((line, i) => (
                      <tr key={i}>
                        {line
                          .split('|')
                          .filter((cell) => cell.trim())
                          .map((cell, j) => (
                            <td key={j}>{cell.trim()}</td>
                          ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            );
          }
        }

        // Párrafo normal
        if (paragraph.trim()) {
          return (
            <p key={idx} className="md-paragraph">
              {paragraph}
            </p>
          );
        }

        return null;
      })
      .filter(Boolean);
  };

  return <div className="markdown-rendered">{parseMarkdown(content)}</div>;
}