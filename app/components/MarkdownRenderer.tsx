import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { Check, Copy } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import styles from "@/styles/markdow-render.module.css";

interface Props {
  content: string;
}

const CodeBlock = ({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const language = className?.replace(/language-/, "") || "text";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  if (inline) {
    return (
      <code className={`${className} ${styles.inlineCode}`}>
        {children}
      </code>
    );
  }

  return (
    <div className={styles.codeBlockContainer}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeLanguage}>{language}</span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          title={copied ? "¡Copiado!" : "Copiar código"}
          aria-label="Copiar código"
        >
          {copied ? (
            <Check size={16} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export function MarkdownRenderer({ content }: Props) {
  const safeContent = typeof content === "string" ? content : "";

  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeHighlight,
          [
            rehypeSanitize,
            {
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
                a: ["href", "title"],
                img: ["src", "alt", "title"],
                code: ["className"],
                pre: ["className"],
              },
            },
          ],
          rehypeKatex,
        ]}
        components={{
          code: CodeBlock,
          h1: ({ node, ...props }) => <h1 className={styles.h1} {...props} />,
          h2: ({ node, ...props }) => <h2 className={styles.h2} {...props} />,
          h3: ({ node, ...props }) => <h3 className={styles.h3} {...props} />,
          h4: ({ node, ...props }) => <h4 className={styles.h4} {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className={styles.blockquote} {...props} />
          ),
          ul: ({ node, ...props }) => <ul className={styles.ul} {...props} />,
          ol: ({ node, ...props }) => <ol className={styles.ol} {...props} />,
          li: ({ node, ...props }) => <li className={styles.li} {...props} />,
          table: ({ node, ...props }) => (
            <div className={styles.tableWrapper}>
              <table className={styles.table} {...props} />
            </div>
          ),
          a: ({ node, ...props }) => <a className={styles.link} {...props} />,
          img: ({ node, ...props }) => (
            <img className={styles.image} {...props} />
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}

