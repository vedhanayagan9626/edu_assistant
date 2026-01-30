import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const ActionBar = ({ onCopy, onFeedback, onRegenerate, isStreaming }) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCopy = () => {
        onCopy?.();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFeedback = (type) => {
        setFeedback(type);
        onFeedback?.(type);
    };

    return (
        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Copy response"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
            </button>

            {!isStreaming && (
                <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Regenerate"
                >
                    <RotateCcw size={14} />
                    Regenerate
                </button>
            )}

            <div className="flex items-center ml-auto border-l border-slate-200 pl-2 gap-1">
                <button
                    onClick={() => handleFeedback('like')}
                    className={twMerge(
                        "p-1 rounded-md transition-colors",
                        feedback === 'like' ? "bg-green-100 text-green-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    )}
                >
                    <ThumbsUp size={14} />
                </button>
                <button
                    onClick={() => handleFeedback('dislike')}
                    className={twMerge(
                        "p-1 rounded-md transition-colors",
                        feedback === 'dislike' ? "bg-red-100 text-red-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    )}
                >
                    <ThumbsDown size={14} />
                </button>
            </div>
        </div>
    );
};
