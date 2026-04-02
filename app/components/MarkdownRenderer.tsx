import React, { useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { Check, Copy } from "lucide-react";
import Image from "next/image";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import styles from "../styles/markdow-render.module.css";

interface Props {
  content: string;
  className?: string;
}

// Componente CodeBlock memoizado - DETECCIÓN AUTOMÁTICA DE CÓDIGO CORTO
const CodeBlock = React.memo(
  ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }) => {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, "");
    const language = className?.replace(/language-/, "") || "text";

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(code).catch(() => {
        // Silently handle copy error
      });
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }, [code]);

    // DETECCIÓN DE CÓDIGO CORTO - Renderizar como inline
    // Si tiene menos de 3 líneas O menos de 50 caracteres, es inline
    const isShortCode = !inline && (
      code.split('\n').length < 3 || 
      code.length < 50
    );

    // Si es código corto, renderizar como inline automáticamente
    if (isShortCode) {
      return (
        <code className={`${className} ${styles.inlineCode}`} {...props}>
          {children}
        </code>
      );
    }

    // Código largo - renderizar como bloque
    return (
      <div className={styles.codeBlockContainer}>
        <div className={styles.codeBlockHeader}>
          <span className={styles.codeLanguage}>{language}</span>
          <button
            onClick={handleCopy}
            className={styles.copyButton}
            title={copied ? "¡Copiado!" : "Copiar código"}
            aria-label="Copiar código"
            type="button"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>Copiar</span>
          </button>
        </div>
        <pre className={className}>
          <code {...props}>{children}</code>
        </pre>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

// Configuración de sanitización
const sanitizeConfig = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "strong",
    "em",
    "u",
    "del",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "a",
    "img",
    "hr",
    "div",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target"],
    img: ["src", "alt", "title", "loading"],
    code: ["className"],
    pre: ["className"],
    "*": ["className"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

// Componentes personalizados
const createComponents = () => ({
  code: CodeBlock,
  h1: ({ node, ...props }: any) => <h1 className={styles.h1} {...props} />,
  h2: ({ node, ...props }: any) => <h2 className={styles.h2} {...props} />,
  h3: ({ node, ...props }: any) => <h3 className={styles.h3} {...props} />,
  h4: ({ node, ...props }: any) => <h4 className={styles.h4} {...props} />,
  h5: ({ node, ...props }: any) => <h5 className={styles.h5} {...props} />,
  h6: ({ node, ...props }: any) => <h6 className={styles.h6} {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote className={styles.blockquote} {...props} />
  ),
  ul: ({ node, ...props }: any) => <ul className={styles.ul} {...props} />,
  ol: ({ node, ...props }: any) => <ol className={styles.ol} {...props} />,
  li: ({ node, ...props }: any) => <li className={styles.li} {...props} />,
  table: ({ node, ...props }: any) => (
    <div className={styles.tableWrapper}>
      <table className={styles.table} {...props} />
    </div>
  ),
  a: ({ node, href, children, ...props }: any) => (
    <a
      className={styles.link}
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ node, alt, src, ...props }: any) => {
    // Si es una imagen externa o no podemos determinar el tamaño, usar img normal con lazy loading
    const isExternal = src?.startsWith('http');
    
    if (isExternal) {
      return (
        <Image
          className={styles.image}
          src={src}
          alt={alt || "Imagen"}
          width={800}
          height={600}
          loading="lazy"
          style={{ width: '100%', height: 'auto' }}
          {...props}
        />
      );
    }
    
    // Para imágenes locales, usar next/image con fill
    return (
      <div className={styles.imageWrapper} style={{ position: 'relative', width: '100%', height: 'auto' }}>
        <Image
          className={styles.image}
          src={src}
          alt={alt || "Imagen"}
          fill
          loading="lazy"
          style={{ objectFit: 'contain' }}
          {...props}
        />
      </div>
    );
  },
  hr: ({ node, ...props }: any) => <hr className={styles.hr} {...props} />,
  p: ({ node, ...props }: any) => <p className={styles.paragraph} {...props} />,
  strong: ({ node, ...props }: any) => (
    <strong className={styles.strong} {...props} />
  ),
  em: ({ node, ...props }: any) => <em className={styles.em} {...props} />,
  del: ({ node, ...props }: any) => <del className={styles.del} {...props} />,
});

export function MarkdownRenderer({ content, className = "" }: Props) {
  // Memoizar contenido
  const safeContent = useMemo(() => {
    if (typeof content !== "string") return "";
    return content.trim() || "";
  }, [content]);

  // Memoizar plugins
  const rehypePlugins = useMemo(
    () => [rehypeHighlight, [rehypeSanitize, sanitizeConfig], rehypeKatex],
    [],
  );

  const remarkPlugins = useMemo(() => [remarkGfm, remarkMath], []);

  // Memoizar componentes
  const components = useMemo(() => createComponents(), []);

  if (!safeContent) {
    return null;
  }

  return (
    <div className={`${styles.markdownContent} ${className}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins as any}
        components={components}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}

// Exportar componente memoizado
export default React.memo(MarkdownRenderer);
