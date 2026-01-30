import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Bell, Info, Mic, Send, RotateCw, Copy, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import ChatResponse from './ChatResponse';

const ChatInterface = ({ subject, onBack }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello! I'm your AI assistant for **${subject.name}**. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [learningLevel, setLearningLevel] = useState('intermediate');
    const [sessionId, setSessionId] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    // Fetch available models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await api.get('/student/llm-models');
                setAvailableModels(res.data);
                // Set first active model as default
                const defaultModel = res.data.find(m => m.is_active);
                if (defaultModel) {
                    setSelectedModel(defaultModel.id);
                }
            } catch (err) {
                console.error("Failed to fetch models", err);
            }
        };
        fetchModels();
    }, []);

    // Initialize or re-initialize chat session when subject OR learning level changes
    useEffect(() => {
        const initChat = async () => {
            try {
                console.log("DEBUG: Initializing chat session...");
                const res = await api.post('/student/chat/start', {
                    subject_id: subject.id,
                    learning_level: learningLevel,
                    llm_model_id: selectedModel
                });
                console.log("DEBUG: Chat session created with ID:", res.data.id);
                setSessionId(res.data.id);

                setMessages([
                    { role: 'assistant', content: `Hello! I'm your AI assistant for **${subject.name}**. I'm set to **${learningLevel}** level explanations. How can I help you?` }
                ]);
            } catch (err) {
                console.error("Failed to start chat session", err);
                toast.error("Could not initialize AI assistant.");
            }
        };
        initChat();
    }, [subject.id, learningLevel, selectedModel]);

    const handleSend = async () => {
        if (!input.trim() || !sessionId) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await api.post(`/student/chat/${sessionId}/message`, {
                message: input
            });

            const aiMsg = {
                role: 'assistant',
                content: res.data.message.content
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error("Chat error", err);
            const errorMsg = err.response?.data?.error || "Sorry, I encountered an error. Please try again.";
            toast.error("Failed to get response from AI.");
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "",
                status: 'error',
                error: errorMsg
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
    };

    const handleFeedback = (idx, type) => {
        console.log(`Feedback for message ${idx}: ${type}`);
        toast.success("Thank you for your feedback!");
    };

    const handleRegenerate = () => {
        // Find last user message
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            setInput(lastUserMsg.content);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{subject.name} AI Helper</h2>
                        <div className="flex items-center gap-4 mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Level:</span>
                                <select
                                    value={learningLevel}
                                    onChange={(e) => setLearningLevel(e.target.value)}
                                    className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 outline-none hover:bg-primary-100 transition-colors cursor-pointer"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Model:</span>
                                <select
                                    value={selectedModel || ''}
                                    onChange={(e) => setSelectedModel(parseInt(e.target.value))}
                                    className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 outline-none hover:bg-primary-100 transition-colors cursor-pointer"
                                >
                                    {availableModels.filter(m => m.is_active).map(model => (
                                        <option key={model.id} value={model.id}>{model.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search in chat..."
                            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none"
                        />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><Bell size={20} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><Info size={20} /></button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                {messages.map((msg, idx) => (
                    <ChatResponse
                        key={idx}
                        role={msg.role}
                        content={msg.content}
                        status={msg.status || 'complete'}
                        onCopy={handleCopy}
                        onFeedback={(type) => handleFeedback(idx, type)}
                        onRegenerate={handleRegenerate}
                    />
                ))}
                {isLoading && (
                    <ChatResponse
                        role="assistant"
                        content=""
                        status="loading"
                    />
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Footer / Input */}
            <div className="p-6 bg-white border-top border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto">
                    <div className="relative flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-400/10 transition-all shadow-sm">
                        <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all">
                            <FileText size={20} />
                        </button>

                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Message AI Assistant..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-2"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={twMerge(
                                "flex items-center justify-center h-10 w-10 rounded-xl transition-all",
                                input.trim() && !isLoading ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:scale-105" : "bg-slate-200 text-slate-400"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-center mt-3 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                        AI-Generated Content • Verify Important Information
                    </p>
                </div>
            </div>
        </div>
    );
};

// Simple pseudo-code block renderer
const CodeBlock = ({ content }) => {
    // Basic parsing for "```lang code ```"
    const parts = content.split(/```(\w+)?/);
    return (
        <div>
            {parts.map((part, i) => {
                if (i % 2 === 0) return <p key={i} style={{ marginBottom: 12 }}>{part}</p>;
                // Code part
                return (
                    <div key={i} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '12px', overflowX: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#9CA3AF', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <span>{parts[i - 1] || 'Code'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Copy size={12} /> Copy code</span>
                        </div>
                        <pre style={{ margin: 0 }}>{part}</pre>
                    </div>
                )
            })}
        </div>
    )
}

const ActionBtn = ({ icon, label }) => (
    <button style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#6B7280', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px'
    }}>
        {icon}
        {label}
    </button>
);

export default ChatInterface;
