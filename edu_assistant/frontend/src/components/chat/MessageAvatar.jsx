import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const MessageAvatar = ({ role, className }) => {
    const isAI = role === 'assistant' || role === 'ai';

    return (
        <div className={twMerge(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
            isAI ? "bg-primary-600 border-primary-700 text-white" : "bg-white border-slate-200 text-slate-600",
            className
        )}>
            {isAI ? (
                <Sparkles size={18} className="animate-pulse" />
            ) : (
                <User size={18} />
            )}
        </div>
    );
};
