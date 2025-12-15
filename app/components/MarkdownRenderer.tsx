import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

// Helper to detect if content looks like code
const looksLikeCode = (text: string): boolean => {
  const codePatterns = [
    /^(import|export|from|const|let|var|function|class|interface|type)\s/m,
    /^(def|class|import|from|return|if|else|elif|for|while)\s/m,
    /^(public|private|protected|static|void|int|string|bool)\s/m,
    /[{}\[\]();].*[{}\[\]();]/,
    /^\s*(\/\/|#|\/\*|\*)/m,
    /=>\s*[{(]/,
    /\.(map|filter|reduce|forEach)\(/,
    /<[A-Z][a-zA-Z]*\s*[/>]/,
  ];
  
  return codePatterns.some(pattern => pattern.test(text));
};

// Detect programming language from content
const detectLanguage = (code: string): string => {
  if (/^(import|export|const|let|var|function|=>|interface|type)\s/m.test(code)) {
    return code.includes('interface') || code.includes(': string') || code.includes(': number') 
      ? 'typescript' 
      : 'javascript';
  }
  if (/^(def|class|import|from|return|if|elif|else|for|while|print)\s/m.test(code) && !code.includes('{')) {
    return 'python';
  }
  if (/^(public|private|protected|static|void|class|namespace)\s/m.test(code)) {
    return code.includes('namespace') ? 'csharp' : 'java';
  }
  if (/<[a-zA-Z][^>]*>/.test(code) && /<\/[a-zA-Z]+>/.test(code)) {
    return code.includes('className') || code.includes('useState') ? 'jsx' : 'html';
  }
  if (/^\s*{[\s\S]*"[\w]+"\s*:/.test(code)) {
    return 'json';
  }
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/im.test(code)) {
    return 'sql';
  }
  if (/^#!\s*\/bin\/(bash|sh)/.test(code) || /^\s*(echo|cd|ls|mkdir|rm)\s/.test(code)) {
    return 'bash';
  }
  return 'text';
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className="prose prose-sm max-w-none dark:prose-invert"
      components={{
        // Custom table styling with better contrast
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-lg border border-border shadow-sm">
            <table className="min-w-full border-collapse bg-card">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/50">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="border border-border bg-muted px-4 py-3 text-left font-bold text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-3 text-foreground bg-card">
            {children}
          </td>
        ),
        // Custom code block with syntax highlighting using CodeBlock component
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const hasNewlines = codeString.includes('\n');
          const isLongCode = codeString.length > 50;
          const looksCode = looksLikeCode(codeString);
          
          // Determine if this should be a code block
          const isBlock = match || hasNewlines || (isLongCode && looksCode);

          if (isBlock) {
            // Determine language
            const language = match ? match[1] : (looksCode ? detectLanguage(codeString) : 'text');
            
            return (
              <CodeBlock language={language}>
                {codeString}
              </CodeBlock>
            );
          }
          
          // Inline code
          return (
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-sm border border-border/50">
              {children}
            </code>
          );
        },
        // Custom pre handler - avoid double wrapping
        pre: ({ children }) => {
          return <>{children}</>;
        },
        // Custom paragraph styling
        p: ({ children }) => (
          <p className="text-foreground leading-relaxed mb-4 last:mb-0">
            {children}
          </p>
        ),
        // Custom list styling
        ul: ({ children }) => (
          <ul className="text-foreground space-y-1 mb-4 last:mb-0 pl-6 list-disc">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="text-foreground space-y-1 mb-4 last:mb-0 pl-6 list-decimal">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-foreground">
            {children}
          </li>
        ),
        // Custom heading styling
        h1: ({ children }) => (
          <h1 className="text-foreground text-xl font-bold mb-4 mt-6 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-foreground text-lg font-semibold mb-3 mt-5 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-foreground text-md font-medium mb-2 mt-4 first:mt-0">
            {children}
          </h3>
        ),
        // Custom blockquote styling
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary bg-muted/50 p-4 my-4 text-foreground italic">
            {children}
          </blockquote>
        ),
        // Custom link styling
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-primary hover:text-primary/80 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        // Custom strong/bold styling
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">
            {children}
          </strong>
        ),
        // Custom emphasis/italic styling
        em: ({ children }) => (
          <em className="italic text-foreground">
            {children}
          </em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
