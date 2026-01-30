import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MessageAvatar } from './MessageAvatar';
import { ContentRenderer } from './ContentRenderer';
import { ActionBar } from './ActionBar';

const ChatResponse = ({
    role,
    content,
    isStreaming = false,
    status = 'complete',
    error = null,
    onCopy,
    onFeedback,
    onRegenerate
}) => {
    const isAI = role === 'assistant' || role === 'ai';

    return (
        <div className={twMerge(
            "group w-full py-8 transition-all duration-300 border-b border-transparent hover:border-slate-100",
            isAI ? "bg-gradient-to-b from-slate-50/80 to-slate-100/30 backdrop-blur-sm" : "bg-white"
        )}>
            <div className="mx-auto flex max-w-5xl gap-4 px-4 md:gap-8 md:px-8 lg:px-12">
                <MessageAvatar role={role} className={isAI ? "shadow-primary-100 ring-2 ring-primary-50 ring-offset-2" : "ring-1 ring-slate-200"} />

                <div className="relative flex flex-col w-full min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold tracking-tight text-slate-800 uppercase">
                            {isAI ? "AI Assistant" : "You"}
                        </span>
                        {status === 'loading' && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-500 animate-pulse bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                Thinking
                            </span>
                        )}
                    </div>

                    <div className="min-h-[20px] overflow-hidden">
                        {status === 'error' ? (
                            <div className="rounded-xl bg-red-50/50 backdrop-blur-sm p-4 text-sm text-red-600 border border-red-200/60 shadow-sm shadow-red-100/50 italic flex flex-col gap-2">
                                <div className="font-bold flex items-center gap-2 not-italic">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Generation Failed
                                </div>
                                {error || "An error occurred while generating the response. Please check your connection or try a different model."}
                            </div>
                        ) : (
                            <ContentRenderer content={content} isStreaming={isStreaming} />
                        )}
                    </div>

                    {isAI && status === 'complete' && (
                        <ActionBar
                            onCopy={() => onCopy?.(content)}
                            onFeedback={onFeedback}
                            onRegenerate={onRegenerate}
                            isStreaming={isStreaming}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatResponse;
