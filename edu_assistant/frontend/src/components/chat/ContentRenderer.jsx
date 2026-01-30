import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [copied, setCopied] = React.useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (inline) {
        return (
            <code className="bg-slate-100 text-primary-600 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                {children}
            </code>
        );
    }

    return (
        <div className="group relative my-4 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4 py-1.5">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {language || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy code'}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    );
};

export const ContentRenderer = ({ content, isStreaming }) => {
    return (
        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-headings:font-bold prose-headings:tracking-tight">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: CodeBlock,
                    // Custom styles for other elements
                    p: ({ children }) => <p className="mb-4 last:mb-0 text-slate-700">{children}</p>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 text-slate-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-slate-900">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-700">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary-300 pl-4 py-1 italic text-slate-600 bg-primary-50/30 rounded-r-md mb-4">
                            {children}
                        </blockquote>
                    ),
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="bg-slate-50 px-4 py-2 text-left font-semibold text-slate-900 border-b border-slate-200">{children}</th>
                    ),
                    td: ({ children }) => <td className="px-4 py-2 border-b border-slate-100 text-slate-700">{children}</td>,
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 underline decoration-primary-300 underline-offset-4 hover:text-primary-700 transition-colors"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
            {isStreaming && (
                <span className="inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-full bg-primary-500 ml-1" />
            )}
        </div>
    );
};
