'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/components/CodeBlock';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

const customSanitizeConfig = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 'del',
    'ul', 'ol', 'li', 'blockquote',
    'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'hr', 'div', 'span'
  ],
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp,
}) => {
  const isAssistant = role === 'assistant';

  const formattedTime = useMemo(() => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  }, [timestamp]);

  return (
    <div
      className={`${styles.messageContainer} ${
        isAssistant ? styles.assistantMessage : styles.userMessage
      }`}
    >
      <div className={styles.messageBubble}>
        <div className={styles.messageContent}>
          {isAssistant ? (
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'plaintext';

                  return inline ? (
                    <code className={styles.inlineCode} {...props}>
                      {children}
                    </code>
                  ) : (
                    <CodeBlock
                      language={language}
                    >
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  );
                },
                blockquote: ({ children }: any) => (
                  <blockquote className={styles.blockquote}>
                    {children}
                  </blockquote>
                ),
                table: ({ children }: any) => (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>{children}</table>
                  </div>
                ),
                thead: ({ children }: any) => (
                  <thead className={styles.tableHead}>{children}</thead>
                ),
                tbody: ({ children }: any) => (
                  <tbody className={styles.tableBody}>{children}</tbody>
                ),
                th: ({ children }: any) => (
                  <th className={styles.tableHeader}>{children}</th>
                ),
                td: ({ children }: any) => (
                  <td className={styles.tableCell}>{children}</td>
                ),
                a: ({ href, children, ...props }: any) => (
                  <a
                    href={href}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                h1: ({ children }: any) => (
                  <h1 className={styles.heading1}>{children}</h1>
                ),
                h2: ({ children }: any) => (
                  <h2 className={styles.heading2}>{children}</h2>
                ),
                h3: ({ children }: any) => (
                  <h3 className={styles.heading3}>{children}</h3>
                ),
                ul: ({ children }: any) => (
                  <ul className={styles.unorderedList}>{children}</ul>
                ),
                ol: ({ children }: any) => (
                  <ol className={styles.orderedList}>{children}</ol>
                ),
                li: ({ children }: any) => (
                  <li className={styles.listItem}>{children}</li>
                ),
                p: ({ children }: any) => (
                  <p className={styles.paragraph}>{children}</p>
                ),
                img: ({ src, alt, ...props }: any) => (
                  <img
                    src={src}
                    alt={alt}
                    className={styles.image}
                    {...props}
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className={styles.userText}>{content}</p>
          )}
        </div>
      </div>

      {timestamp && (
        <div className={styles.timestamp}>
          {formattedTime}
        </div>
      )}
    </div>
  );
};
