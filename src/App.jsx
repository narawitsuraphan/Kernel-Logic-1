import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import baseSystemPrompt from './basePrompt.txt?raw';
import codeSystemPrompt from './codePrompt.txt?raw';

// --- CSS ---
const GlobalStyles = () => (
  <style>{`
    @keyframes claude-sprite {
      to { transform: translateY(-100%); }
    }
    .animate-claude-sprite {
      animation: claude-sprite 1s steps(15) infinite;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }
    /* Dark mode scrollbar for code blocks */
    .dark-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
    }
    .dark-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .loading-dots:after {
      content: ' .';
      animation: dots 1.5s steps(5, end) infinite;
    }
    @keyframes dots {
      0%, 20% { content: ' .'; }
      40% { content: ' ..'; }
      60% { content: ' ...'; }
      80%, 100% { content: ''; }
    }
  `}</style>
);

// --- Icon Components ---
const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const MessageIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.84 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.221-1.125-2.114-2.333-2.114h-8.252c-1.208 0-2.333.893-2.333 2.114v3.536m-10.136-3.1m-2.136 2.1M1.5 12.25c0-1.22.9-2.186 2.114-2.29 2.02-.17 4.053-.257 6.095-.257s4.075.087 6.095.256c1.214.104 2.114 1.07 2.114 2.29v3.535c0 1.22-.9 2.187-2.114 2.29a48.7 48.7 0 01-6.095.256c-2.042 0-4.075-.086-6.095-.256C2.4 18.022 1.5 17.056 1.5 15.836v-3.535z" />
  </svg>
);

const SendIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const PaperclipIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const StopIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
  </svg>
);

const CodeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const GlobeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const fetchUrlContent = async (url) => {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`);
    if (!response.ok) throw new Error("Failed to fetch content");
    return await response.text();
  } catch (error) {
    console.error("URL Fetch Error:", error);
    throw error;
  }
};

const KernelLogicIcon = ({ className = "w-5 h-5", isAnimating = false }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
  >
    {/* Outer Orbital Ring */}
    <g className={`${isAnimating ? 'animate-spin' : ''} origin-center`} style={{ animationDuration: '3s' }}>
      <path d="M12 3 A 9 9 0 0 1 21 12" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 21 A 9 9 0 0 1 3 12" strokeWidth="1.5" strokeLinecap="round" className="opacity-40" />
    </g>

    {/* Inner Orbital Ring */}
    <g className={`${isAnimating ? 'animate-spin' : ''} origin-center`} style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
      <path d="M7 12 A 5 5 0 0 1 12 7" strokeWidth="2" strokeLinecap="round" className="opacity-80" />
      <path d="M17 12 A 5 5 0 0 1 12 17" strokeWidth="2" strokeLinecap="round" className="opacity-30" />
    </g>

    {/* AI Core */}
    <circle
      cx="12" cy="12" r="2.5"
      fill="currentColor"
      stroke="none"
      className={`${isAnimating ? 'scale-125 opacity-100' : 'opacity-80'} origin-center transition-all duration-500`}
    />
  </svg>
);

const MarkdownRenderer = React.memo(({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = inline;
          if (!isInline && match) {
            return (
              <div className="relative group my-4 rounded-lg overflow-hidden bg-[#1E1E1E] shadow-md">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-gray-300 select-none">
                  <span className="uppercase font-semibold tracking-wider">{match[1]}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    คัดลอก
                  </button>
                </div>
                <div className="custom-scrollbar dark-scrollbar overflow-x-auto">
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: '1.25rem' }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          } else if (!isInline) {
            return (
              <div className="relative group my-4 rounded-lg overflow-hidden bg-[#1E1E1E] shadow-md">
                <div className="custom-scrollbar dark-scrollbar overflow-x-auto">
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language="text"
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1.25rem' }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            )
          }
          return (
            <code {...props} className="bg-gray-200 px-1.5 py-0.5 rounded text-[13px] text-pink-600 font-mono">
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed text-[15px]">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 mb-2 space-y-1 text-[15px]">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 mb-2 space-y-1 text-[15px]">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-2 mt-4">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mb-2 mt-3">{children}</h3>;
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{children}</a>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

const ReasoningBox = React.memo(({ content, isThinking }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (content === null || (content.trim() === '' && !isThinking)) return null;

  return (
    <div className="w-full mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer group shadow-sm
          ${isExpanded
            ? 'bg-stone-50 border-stone-200 text-stone-600'
            : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 hover:text-stone-500'
          }`}
      >
        <div className={`transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90' : ''}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
          {isThinking ? (
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-400"></span>
              </span>
              <span className="loading-dots">Deep Thinking...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="w-3 h-3 opacity-70" />
              Reasoning Process
            </span>
          )}
        </div>

        {!isExpanded && !isThinking && content && (
          <span className="text-[10px] text-stone-300 font-normal truncate max-w-[150px] hidden sm:inline">
            — {content.slice(0, 40)}...
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 ml-3 pl-4 border-l-2 border-stone-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <div className={`text-[14px] leading-relaxed italic transition-all duration-700 ${isThinking
              ? 'text-stone-400/80'
              : 'text-stone-500/90'
              }`}>
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const ChatMessage = React.memo(({ msg, isTyping, parseMessageText }) => {
  return (
    <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {msg.role === 'ai' && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-md bg-[#F2EFE9] border border-[#E8E4DD] flex items-center justify-center text-[#D97757] shadow-sm">
            <KernelLogicIcon className="w-[18px] h-[18px]" />
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
        {msg.role === 'ai' && (() => {
          const { thinkContent, mainContent, isThinking } = parseMessageText(msg.text, msg.isComplete);

          return (
            <div className="w-full flex flex-col gap-2">
              {/* Code Mode Badge */}
              {msg.isCodeMode && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 ml-1 opacity-80">
                  <CodeIcon className="w-3 h-3" />
                  Code Generation Mode
                </div>
              )}

              <ReasoningBox content={thinkContent} isThinking={isThinking} />

              {(mainContent.trim() !== '' || isThinking) ? (
                <div className={`px-5 py-3.5 rounded-[22px] border text-stone-800 w-fit max-w-full shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300
                              ${msg.isCodeMode ? 'bg-white border-indigo-100 shadow-indigo-50/50' : 'bg-[#F9F8F6] border-[#EAE8E2]'}
                            `}>
                  {mainContent.trim() === '' && !msg.isComplete ? (
                    <div className="flex items-center gap-2 text-stone-400 italic text-sm py-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      AI กำลังเตรียมคำตอบ...
                    </div>
                  ) : (
                    <MarkdownRenderer content={mainContent.trimStart()} />
                  )}
                </div>
              ) : msg.isComplete && !thinkContent && (
                <div className="px-5 py-3.5 rounded-[22px] bg-red-50 border border-red-100 text-red-600 text-sm italic">
                  ไม่มีการตอบรับจากโมเดล โปรดลองใหม่อีกครั้ง
                </div>
              )}
            </div>
          );
        })()}

        {msg.role === 'user' && (
          <div className="px-5 py-3.5 rounded-[24px] bg-[#F3F2EF] text-stone-800 max-w-full inline-block">
            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {msg.text}
            </div>
          </div>
        )}
        <span className="text-xs text-stone-400 mt-1.5 px-1">{msg.time}</span>
      </div>
    </div>
  );
});

// --- Configuration ---
const APP_CONFIG = {
  chatModel: 'qwen3.6:35b', // โมเดลหลักสำหรับการแชททั่วไป
  codeModel: 'qwen3.6:35b', // โมเดลเฉพาะสำหรับโหมดเขียนโค้ด
};


// --- Main Application ---
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Model selection state
  const [selectedModel] = useState(APP_CONFIG.chatModel);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [showCodeToolAlert, setShowCodeToolAlert] = useState(false);
  const [chatTemperature, setChatTemperature] = useState(() => {
    const saved = localStorage.getItem('ns_ai_temperature');
    return saved ? parseFloat(saved) : 0.3;
  });
  const [contextWindow, setContextWindow] = useState(() => {
    const saved = localStorage.getItem('ns_ai_context_window');
    return saved ? parseInt(saved) : 16384;
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    // Priority: LocalStorage > Environment Variable
    const saved = localStorage.getItem('ns_ai_gemini_key');
    if (saved) return saved;
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [activeProvider, setActiveProvider] = useState(() => {
    return localStorage.getItem('ns_ai_provider') || 'ollama';
  });

  useEffect(() => {
    localStorage.setItem('ns_ai_temperature', chatTemperature);
    localStorage.setItem('ns_ai_context_window', contextWindow);
    localStorage.setItem('ns_ai_gemini_key', geminiApiKey);
    localStorage.setItem('ns_ai_provider', activeProvider);
  }, [chatTemperature, contextWindow, geminiApiKey, activeProvider]);

  // Chat Sessions State
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem('ollama_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load chats", e);
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('ollama_current_chat_id');
    return saved ? saved : null;
  });

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('ollama_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('ollama_current_chat_id', currentChatId);
    } else {
      localStorage.removeItem('ollama_current_chat_id');
    }
  }, [currentChatId]);



  const handleNewChat = () => {
    setCurrentChatId(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  // Auto scroll to bottom when messages change
  const scrollToBottom = (force = false) => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150; // 150px threshold

    if (force || isAtBottom) {
      // Use 'auto' during typing for better performance and less "fighting" with user scroll
      messagesEndRef.current?.scrollIntoView({ behavior: isTyping ? "auto" : "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (!inputText && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [inputText]);

  const parseMessageText = (rawText, isComplete = false) => {
    if (!rawText) return { thinkContent: null, mainContent: '', isThinking: false };

    let thinkContent = '';
    let mainContent = rawText;
    let isThinking = false;

    const thinkStartRegex = /<(think|thought)>/i;
    const thinkEndRegex = /<\/(think|thought)>/i;

    let processing = true;
    while (processing) {
      const startMatch = mainContent.match(thinkStartRegex);
      const endMatch = mainContent.match(thinkEndRegex);

      if (startMatch && endMatch) {
        // Case: Both tags found
        if (startMatch.index < endMatch.index) {
          // Normal order: <think>...</think>
          const content = mainContent.slice(startMatch.index + startMatch[0].length, endMatch.index);
          thinkContent += (thinkContent ? '\n' : '') + content.trim();
          mainContent = mainContent.slice(0, startMatch.index) + mainContent.slice(endMatch.index + endMatch[0].length);
        } else {
          // Weird order: ...</think>...<think>...
          // Treat everything before the first </think> as reasoning
          const content = mainContent.slice(0, endMatch.index);
          thinkContent += (thinkContent ? '\n' : '') + content.trim();
          mainContent = mainContent.slice(endMatch.index + endMatch[0].length);
        }
      } else if (startMatch) {
        // Case: Only start tag found (still thinking)
        const content = mainContent.slice(startMatch.index + startMatch[0].length);
        thinkContent += (thinkContent ? '\n' : '') + content.trim();
        mainContent = mainContent.slice(0, startMatch.index);
        isThinking = !isComplete;
        processing = false;
      } else if (endMatch) {
        // Case: Only end tag found
        const content = mainContent.slice(0, endMatch.index);
        thinkContent += (thinkContent ? '\n' : '') + content.trim();
        mainContent = mainContent.slice(endMatch.index + endMatch[0].length);
      } else {
        // Case: No more tags
        processing = false;
      }
    }

    return {
      thinkContent: thinkContent.trim() || null,
      mainContent: mainContent.trim(),
      isThinking
    };
  };

  const [isReadingUrl, setIsReadingUrl] = useState(false);

  const handleReadUrl = async (specificUrl = null) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const targetUrl = specificUrl || (inputText.match(urlRegex)?.[0]);
    
    if (!targetUrl) return;

    setIsReadingUrl(true);
    try {
      const content = await fetchUrlContent(targetUrl);
      
      // Inject content into input
      setInputText(prev => {
        // If it was just the URL being pasted, replace it with the rich prompt
        // Otherwise append it
        const base = prev.includes(targetUrl) ? prev : prev + "\n" + targetUrl;
        return `${base}\n\nนี่คือข้อมูลอ้างอิงจาก URL: ${targetUrl}\n---\n${content}\n---\n\nจากข้อมูลด้านบน ช่วย...`;
      });
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error("Auto Read Error:", error);
    } finally {
      setIsReadingUrl(false);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    const urlRegex = /^(https?:\/\/[^\s]+)$/; // Check if it's ONLY a URL being pasted
    if (urlRegex.test(pastedText.trim())) {
      handleReadUrl(pastedText.trim());
    }
  };

  const handleSendMessage = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    const textToSend = forcedText || inputText.trim();

    if (!textToSend || isTyping) return;

    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = Date.now().toString();
      setCurrentChatId(activeChatId);
      // Synchronously add the new chat before we process messages
      setChats(prev => [{ id: activeChatId, title: 'New Chat', messages: [], updatedAt: Date.now() }, ...prev]);
    }

    const newUserMsg = {
      id: Date.now(),
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updateChatMessages = (updater) => {
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          const newMessages = typeof updater === 'function' ? updater(chat.messages) : updater;
          let title = chat.title;
          if (title === 'New Chat' && newMessages.length > 0) {
            const firstUser = newMessages.find(m => m.role === 'user');
            if (firstUser) title = firstUser.text.slice(0, 30) + (firstUser.text.length > 30 ? '...' : '');
          }
          return { ...chat, messages: newMessages, title, updatedAt: Date.now() };
        }
        return chat;
      }));
    };

    updateChatMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // Force scroll to bottom when user sends a message
    setTimeout(() => scrollToBottom(true), 50);

    // Get context for API using the existing state
    const activeChat = chats.find(c => c.id === activeChatId);
    const currentMessages = activeChat ? activeChat.messages : [];

    const currentCodeMode = isCodeMode;

    const systemPromptContent = currentCodeMode ? codeSystemPrompt : baseSystemPrompt;

    // Cancel any previous requests if they exist
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const aiMsgId = Date.now() + 1;
      let aiFullText = '';
      let isFirstChunk = true;

      if (activeProvider === 'gemini') {
        if (!geminiApiKey) throw new Error("GEMINI_KEY_MISSING");

        const modelName = currentCodeMode ? "gemini-2.0-flash" : "gemini-2.0-flash"; // Using 2.0 Flash for both as it's very capable
        const history = currentMessages.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

        const response = await fetch(`https://generativelayerextension.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPromptContent }] },
            contents: [...history, { role: 'user', parts: [{ text: textToSend }] }],
            generationConfig: {
              temperature: currentCodeMode ? 0.2 : chatTemperature,
              maxOutputTokens: 16384,
            }
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) throw new Error("Gemini API Error");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                aiFullText += textChunk;

                if (isFirstChunk) {
                  isFirstChunk = false;
                  updateChatMessages(prev => [...prev, {
                    id: aiMsgId,
                    role: 'ai',
                    text: aiFullText,
                    isCodeMode: currentCodeMode,
                    isComplete: false,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                } else {
                  updateChatMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, text: aiFullText } : m
                  ));
                }
              } catch (e) { }
            }
          }
        }
      } else {
        // Ollama Path
        const apiMessages = [
          { role: 'system', content: systemPromptContent },
          ...currentMessages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text
          })),
          { role: 'user', content: textToSend }
        ];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: currentCodeMode ? APP_CONFIG.codeModel : selectedModel,
            messages: apiMessages,
            stream: true,
            options: {
              temperature: currentCodeMode ? 0.2 : chatTemperature,
              num_ctx: contextWindow,
              num_predict: 16384
            }
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) throw new Error('Ollama response error');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkValue = decoder.decode(value, { stream: true });
          const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message) {
                const contentToAdd = parsed.message.content || '';
                const thinkingToAdd = parsed.message.thinking || parsed.message.reasoning || parsed.message.reasoning_content || '';

                if (contentToAdd || thinkingToAdd) {
                  if (isFirstChunk) {
                    isFirstChunk = false;
                    let initialText = contentToAdd;
                    if (thinkingToAdd) initialText = '<think>\n' + thinkingToAdd;
                    updateChatMessages(prev => [...prev, {
                      id: aiMsgId,
                      role: 'ai',
                      isCodeMode: currentCodeMode,
                      isComplete: false,
                      text: initialText,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                  } else {
                    updateChatMessages(prev => prev.map(msg => {
                      if (msg.id === aiMsgId) {
                        let newText = msg.text;
                        if (thinkingToAdd) {
                          if (!newText.includes('<think>')) newText += '<think>\n';
                          newText += thinkingToAdd;
                        } else if (contentToAdd) {
                          if (newText.includes('<think>') && !newText.includes('</think>')) newText += '\n</think>\n\n';
                          newText += contentToAdd;
                        }
                        return { ...msg, text: newText };
                      }
                      return msg;
                    }));
                  }
                }
              }
            } catch (e) { }
          }
        }
      }

      updateChatMessages(prev => prev.map(msg =>
        msg.id === aiMsgId ? { ...msg, isComplete: true } : msg
      ));
      setIsTyping(false);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching AI response:', error);
        setIsTyping(false);
        updateChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'ai',
          text: 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้ในขณะนี้ โปรดตรวจสอบว่ารัน SERVER อยู่และเชื่อมต่อได้ปกติ',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#FBF9F6] border-r border-stone-200/50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full bg-transparent hover:bg-[#EAE8E2] text-stone-700 px-4 py-2.5 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            แชทใหม่
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 mt-4">ประวัติการคุย</p>
          {chats.length === 0 && (
            <div className="px-3 text-sm text-stone-400 italic">ยังไม่มีประวัติแชท</div>
          )}
          {chats.sort((a, b) => b.updatedAt - a.updatedAt).map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group
                ${currentChatId === chat.id ? 'bg-[#EAE8E2] text-stone-900 font-semibold shadow-sm' : 'hover:bg-[#EAE8E2]/50 text-stone-600'}
              `}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageIcon className={`w-5 h-5 flex-shrink-0 ${currentChatId === chat.id ? 'opacity-70' : 'opacity-50'}`} />
                <span className="truncate">{chat.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-all p-1"
                title="ลบแชท"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>


      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-white relative w-full">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-3 px-1 py-1.5">
              <h1 className="font-bold text-xl text-stone-800 font-serif tracking-tight">Kernel Logic 1</h1>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            </div>
          </div>
          <button className="p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-full hover:bg-stone-100">
            <UserIcon />
          </button>
        </header>

        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto text-center px-4 py-8 animate-in fade-in zoom-in-95 duration-1000">
              <div className="mb-10 relative">
                <div className="absolute inset-0 bg-stone-200 blur-3xl opacity-20 rounded-full"></div>
                <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 relative">Good afternoon</h2>
                <p className="text-stone-400 text-lg">How can I help you today?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                {[
                  { text: "เขียนโค้ด React สำหรับหน้า Login", icon: "✨" },
                  { text: "ช่วยสรุปหนังสือ Atomic Habits", icon: "📚" },
                  { text: "แนะนำที่เที่ยวญี่ปุ่น 5 วันแบบประหยัด", icon: "✈️" },
                  { text: "อธิบาย Quantum Computing ให้ง่ายที่สุด", icon: "🧠" }
                ].map(prompt => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSendMessage(null, prompt.text)}
                    className="flex items-center gap-3 px-5 py-4 bg-white hover:bg-[#F9F8F6] border border-[#EAE8E2] hover:border-stone-300 rounded-2xl text-sm text-left text-stone-600 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <span className="text-lg group-hover:scale-125 transition-transform">{prompt.icon}</span>
                    <span className="font-medium">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-3xl mx-auto space-y-8 pb-8 pt-6 px-4 sm:px-6 md:px-8">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  isTyping={isTyping}
                  parseMessageText={parseMessageText}
                />
              ))}

              {/* Typing Indicator */}
              {isTyping && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4 flex-row">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-md bg-[#F2EFE9] border border-[#E8E4DD] flex items-center justify-center text-[#D97757] shadow-sm">
                      <KernelLogicIcon className="w-[18px] h-[18px]" isAnimating={true} />
                    </div>
                  </div>
                  <div className="bg-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white z-10 flex-shrink-0 pb-8">
          <div className="max-w-3xl mx-auto relative">

            {/* Code Mode Toggle - Premium Slider */}
            <div className="flex justify-start mb-3 px-1">
              <div
                onClick={() => {
                  const newMode = !isCodeMode;
                  setIsCodeMode(newMode);
                  if (newMode) setShowCodeToolAlert(true);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isCodeMode ? 'bg-indigo-500' : 'bg-stone-300'}`}>
                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${isCodeMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors duration-300">
                  <CodeIcon className={`w-3.5 h-3.5 ${isCodeMode ? 'text-indigo-600' : 'text-stone-400'}`} />
                  <span className={isCodeMode ? 'text-indigo-600' : 'text-stone-500'}>
                    Code Mode {isCodeMode ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="flex items-end gap-2 bg-stone-100/50 hover:bg-stone-100 focus-within:bg-white border border-stone-200/50 focus-within:border-stone-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[28px] p-2 transition-all duration-300 backdrop-blur-sm"
            >
              <button
                type="button"
                className="p-3 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors flex-shrink-0 cursor-pointer"
                title="แนบไฟล์"
              >
                <PaperclipIcon />
              </button>

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={isTyping}
                placeholder={isTyping ? "AI กำลังประมวลผล..." : "พิมพ์ข้อความให้ AI ช่วยเหลือ..."}
                className="flex-1 max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-3 px-2 text-stone-800 placeholder-stone-400 disabled:opacity-50"
                rows="1"
                style={{ overflowY: 'hidden' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  if (e.target.value) {
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    if (e.target.scrollHeight > 200) e.target.style.overflowY = 'auto';
                    else e.target.style.overflowY = 'hidden';
                  }
                }}
              />

              {isTyping ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-3 rounded-full flex-shrink-0 transition-all bg-stone-200 text-stone-600 hover:bg-stone-300 cursor-pointer shadow-sm mb-0.5 mr-0.5"
                  title="หยุดการตอบกลับ"
                >
                  <StopIcon />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-3 rounded-full flex-shrink-0 transition-all mb-0.5 mr-0.5 ${inputText.trim()
                    ? 'bg-stone-800 text-white shadow-md hover:bg-stone-700 cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </form>
            <div className="text-center mt-3">
              <span className="text-xs text-stone-400">AI สามารถผิดพลาดได้ โปรดตรวจสอบข้อความสำคัญอีกครั้ง</span>
            </div>
          </div>
        </div>

      </main>

      {/* Code Tool Alert Modal */}
      {showCodeToolAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-8 text-center transform animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CodeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">คำเตือนการประมวลผล</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              โหมดเขียนโค้ดใช้โมเดลขนาดใหญ่ (<span className="font-semibold text-indigo-600">{APP_CONFIG.codeModel}</span>)
              ซึ่งอาจใช้เวลาประมวลผลนานกว่าปกติเนื่องจากทรัพยากรเซิร์ฟเวอร์จำกัด โปรดรอสักครู่ขณะระบบกำลังทำงาน
            </p>
            <button
              onClick={() => setShowCodeToolAlert(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
