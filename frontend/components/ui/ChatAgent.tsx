'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, X, Send, ChevronDown, RotateCcw,
  Gavel, PieChart, BarChart3, Maximize2,
} from 'lucide-react';
import clsx from 'clsx';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

type MessageRole = 'user' | 'assistant';
type ChatStatus = 'idle' | 'streaming' | 'done';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// ─────────────────────────────────────────
// MOCK RESPONSES — context-aware
// ─────────────────────────────────────────

const RESPONSES: Record<string, string> = {
  default: `I'm your AdBid AI assistant. I can help you analyze auction performance, explain bid decisions, optimize budget allocation, and interpret competitor signals across all your campaigns.\n\nTry asking about a specific slot, platform, or strategy.`,
  win: `Your current win rate is **71.3%** — up **2.1%** week-over-week.\n\nGoogle Search branded slots are performing best at **87% win rate**, driven by the aggressive bid rule. Meta retargeting is at **61%**, which is within target range given the CPM constraints.\n\nThe main drag is TTD Display at **18%** — I recommend holding those slots until floor prices normalize.`,
  budget: `Budget pacing is on track at **74.8% spend** through day 14 of the month.\n\n**Key insight:** Amazon DSP is delivering **6.2x ROAS** — the highest across all channels — yet only receives 14.4% of total allocation. Shifting **$4,500** from Meta Broad to Amazon DSP is projected to improve blended ROAS from **3.8x to 4.1x**.\n\nLinkedIn's daily cap of **$2,500** is being maintained despite strong B2B CVR.`,
  competitor: `Amazon DSP is showing **extreme competitor pressure** (91% score) — the P75 bid is $9.80 CPM while your last bid was $5.10, placing you below median.\n\nGoogle Search has **high pressure** (72%) but your branded terms strategy is competitive at $4.85 vs P50 of $3.40.\n\nRecommendation: Increase Amazon DSP bids by **15%** per the competitor pressure rule, which triggers above the 0.75 threshold.`,
  strategy: `**5 active strategy rules** are governing current bid behavior:\n\n1. **Aggressive bid on branded terms** — triggered 847× today\n2. **Budget pacing guardrail** — monitoring at 74.8% spend\n3. **Competitor pressure response** — conditional, watching Amazon DSP\n4. **Weekend ROAS floor** — will activate Saturday at midnight\n5. **LinkedIn B2B daily cap** — enforcing $2,500/day limit\n\nAll rules are within normal operating parameters.`,
  simulation: `The latest simulation (1,000 runs) shows the **AI Optimized strategy** achieving a **71.3% win rate** at **$3.82 average cost-per-win** — outperforming all fixed-bid alternatives.\n\nKey finding: Aggressive bidding (max CPM) wins more auctions (89.1%) but at **93.7% higher cost-per-win**, making it viable only for pure volume objectives.\n\nConfidence level: **94%** based on 6-month historical calibration.`,
  skip: `The TTD Display slot was **skipped** because the projected win probability was **18%** — well below the minimum threshold of 35% set in the bidding strategy.\n\nThe floor price at $0.80 CPM and your bid of $1.05 positions you below the market P25 of $0.60, meaning competitors are already bidding more aggressively on this inventory.\n\nRecommendation: Revisit TTD Display slots when competitor pressure decreases or floor prices reset.`,
  meta: `Meta campaign performance is mixed:\n\n- **Retargeting L30:** Strong at $7.20 recommended bid, 61% win rate, 8.9% CVR ✓\n- **Broad Prospecting:** Held — audience signal score below 0.4, CPM efficiency poor\n\nWeek-over-week Meta spend is down **5.1%** due to audience fatigue on broad segments. The retargeting pool remains healthy but inventory is constrained.\n\nSuggestion: Refresh creative assets on Meta Broad or reallocate budget to higher-performing channels.`,
};

function getResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('win rate') || q.includes('won') || q.includes('winning')) return RESPONSES.win;
  if (q.includes('budget') || q.includes('spend') || q.includes('allocat')) return RESPONSES.budget;
  if (q.includes('competitor') || q.includes('pressure') || q.includes('amazon')) return RESPONSES.competitor;
  if (q.includes('strategy') || q.includes('rule') || q.includes('guardrail')) return RESPONSES.strategy;
  if (q.includes('sim') || q.includes('monte carlo') || q.includes('scenario')) return RESPONSES.simulation;
  if (q.includes('skip') || q.includes('ttd') || q.includes('display')) return RESPONSES.skip;
  if (q.includes('meta') || q.includes('facebook') || q.includes('retarget')) return RESPONSES.meta;
  return RESPONSES.default;
}

// ─────────────────────────────────────────
// SUGGESTED PROMPTS
// ─────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { label: 'Win rate today',       icon: BarChart3, query: 'What is the current win rate?' },
  { label: 'Budget status',        icon: PieChart,  query: 'How is budget pacing going?' },
  { label: 'Why skip TTD?',        icon: Gavel,     query: 'Why did we skip the TTD Display slot?' },
  { label: 'Competitor signals',   icon: Sparkles,  query: 'Explain the competitor pressure situation' },
];

// ─────────────────────────────────────────
// MARKDOWN-LITE RENDERER
// ─────────────────────────────────────────

function RenderMessage({ content }: { content: string }) {
  return (
    <div className="text-13 leading-relaxed space-y-2">
      {content.split('\n\n').map((para, i) => {
        const parts = para.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="font-semibold text-b700">{part.slice(2, -2)}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// STREAMING TEXT
// ─────────────────────────────────────────

function StreamingMessage({ content, onDone }: { content: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < content.length) {
        setDisplayed(content.slice(0, i + 4));
        i += 4;
      } else {
        setDisplayed(content);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone();
        }
        clearInterval(interval);
      }
    }, 14);
    return () => clearInterval(interval);
  }, [content, onDone]);

  return (
    <div className="text-13 leading-relaxed space-y-2">
      {displayed.split('\n\n').map((para, i) => {
        const parts = para.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="font-semibold text-b700">{part.slice(2, -2)}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
      {displayed.length < content.length && (
        <span className="blink-cursor" aria-hidden="true" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5">
      <div className="flex items-center gap-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-b500"
            style={{ animation: `typingBounce 1.2s ${delay}ms ease-in-out infinite` }}
          />
        ))}
      </div>
      <span className="text-12 text-ts">Agent thinking…</span>
    </div>
  );
}

// ─────────────────────────────────────────
// CHAT PANEL
// ─────────────────────────────────────────

interface ChatPanelProps {
  onClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

function ChatPanel({ onClose, expanded, onToggleExpand }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: RESPONSES.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('done');
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const sendMessage = useCallback((query: string) => {
    const q = query.trim();
    if (!q || status === 'streaming') return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStatus('streaming');

    // Simulate a brief "thinking" delay, then stream
    const response = getResponse(q);
    setTimeout(() => {
      setStreamingContent(response);
    }, 600);
  }, [status]);

  const handleStreamDone = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: streamingContent,
        timestamp: new Date(),
      },
    ]);
    setStreamingContent('');
    setStatus('done');
  }, [streamingContent]);

  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: RESPONSES.default,
      timestamp: new Date(),
    }]);
    setStatus('done');
    setStreamingContent('');
  };

  const panelWidth  = expanded ? '520px' : '380px';
  const panelHeight = expanded ? '640px' : '520px';

  return (
    <div
      className="fixed bottom-20 right-5 z-50 flex flex-col bg-surface rounded-2xl border border-bdr shadow-dropdown overflow-hidden animate-fade-in"
      style={{ width: panelWidth, height: panelHeight, transition: 'width 200ms ease, height 200ms ease' }}
      role="dialog"
      aria-label="AdBid AI chat agent"
      aria-modal="false"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-bdr bg-surface flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-b500 flex items-center justify-center flex-shrink-0">
          <Sparkles size={13} strokeWidth={2} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-13 font-semibold text-tp leading-tight">AdBid AI</p>
          <div className="flex items-center gap-1.5">
            <span className="status-dot-active" style={{ width: 5, height: 5 }} aria-hidden="true" />
            <span className="text-11 text-ts">claude-sonnet-4-6 · Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-tt hover:text-ts hover:bg-hov transition-colors"
            aria-label="Reset conversation"
            title="New conversation"
          >
            <RotateCcw size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-tt hover:text-ts hover:bg-hov transition-colors"
            aria-label={expanded ? 'Collapse chat' : 'Expand chat'}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <Maximize2 size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-tt hover:text-ts hover:bg-hov transition-colors"
            aria-label="Close chat"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-b500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={11} strokeWidth={2} className="text-white" />
              </div>
            )}
            <div
              className={clsx(
                'rounded-xl px-3.5 py-2.5 max-w-[85%]',
                msg.role === 'user'
                  ? 'bg-b500 text-white rounded-br-sm'
                  : 'bg-hov border border-bdr text-tp rounded-bl-sm',
              )}
            >
              {msg.role === 'user'
                ? <p className="text-13 leading-relaxed">{msg.content}</p>
                : <RenderMessage content={msg.content} />
              }
              <p className={clsx(
                'text-11 mt-1.5',
                msg.role === 'user' ? 'text-white/60 text-right' : 'text-tt',
              )}>
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming assistant message */}
        {status === 'streaming' && streamingContent === '' && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-md bg-b500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={11} strokeWidth={2} className="text-white" />
            </div>
            <div className="bg-hov border border-bdr rounded-xl rounded-bl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        {status === 'streaming' && streamingContent !== '' && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-md bg-b500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={11} strokeWidth={2} className="text-white" />
            </div>
            <div className="bg-hov border border-bdr rounded-xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%]">
              <StreamingMessage content={streamingContent} onDone={handleStreamDone} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggested prompts (only when idle at top) ── */}
      {messages.length <= 1 && status === 'done' && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
          {SUGGESTED_PROMPTS.map(({ label, icon: Icon, query }) => (
            <button
              key={label}
              onClick={() => sendMessage(query)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-bdr text-12 text-ts bg-surface hover:border-b500 hover:text-b700 hover:bg-b100 transition-colors"
            >
              <Icon size={11} strokeWidth={1.5} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div className="px-3 pb-3 pt-2 border-t border-bdr flex-shrink-0 bg-surface">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask about bids, strategy, competitors…"
              disabled={status === 'streaming'}
              className="w-full h-9 pl-3 pr-3 bg-hov border border-bdr rounded-lg text-13 text-tp placeholder:text-tt focus:bg-surface focus:border-b500 transition-colors outline-none disabled:opacity-50"
              aria-label="Chat input"
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || status === 'streaming'}
            className="h-9 w-9 rounded-lg bg-b500 text-white flex items-center justify-center hover:bg-b700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={14} strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-11 text-tt mt-2 text-center">
          Context-aware · Powered by Claude Sonnet 4.6
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FAB BUTTON
// ─────────────────────────────────────────

interface FABProps {
  onClick: () => void;
  isOpen: boolean;
  unread: number;
}

function FAB({ onClick, isOpen, unread }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full shadow-dropdown flex items-center justify-center transition-all duration-200',
        isOpen
          ? 'bg-surface border border-bdr text-ts hover:text-tp hover:bg-hov'
          : 'bg-b500 text-white hover:bg-b700 hover:scale-105',
      )}
      aria-label={isOpen ? 'Close AI chat' : 'Open AI chat agent'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <ChevronDown size={18} strokeWidth={1.5} />
      ) : (
        <>
          <Sparkles size={18} strokeWidth={2} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-r500 text-white text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────
// EXPORTED WIDGET
// ─────────────────────────────────────────

export function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {isOpen && (
        <ChatPanel
          onClose={() => setIsOpen(false)}
          expanded={expanded}
          onToggleExpand={() => setExpanded((p) => !p)}
        />
      )}
      <FAB
        onClick={() => setIsOpen((p) => !p)}
        isOpen={isOpen}
        unread={isOpen ? 0 : 0}
      />

      {/* Typing bounce keyframe injected inline */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
