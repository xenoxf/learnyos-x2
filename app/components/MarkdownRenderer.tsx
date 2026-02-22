import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import styles from "@/styles/markdow-render.module.css";

interface Props {
  content: string;
}

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
        ]}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}
