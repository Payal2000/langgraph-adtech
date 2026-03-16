'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ReasoningPanelProps {
  reasoning: string;
  streaming?: boolean;
  compact?: boolean;
  title?: string;
}

/** Renders reasoning text with **bold** markdown support */
function RenderReasoning({ text }: { text: string }) {
  // Split by **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-b700">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function ReasoningPanel({
  reasoning,
  streaming = false,
  compact = false,
  title = 'Agent reasoning',
}: ReasoningPanelProps) {
  const [displayed, setDisplayed] = useState('');
  const [isStreaming, setIsStreaming] = useState(streaming);

  useEffect(() => {
    if (!streaming) {
      setDisplayed(reasoning);
      setIsStreaming(false);
      return;
    }

    setDisplayed('');
    setIsStreaming(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < reasoning.length) {
        setDisplayed(reasoning.slice(0, i + 1));
        i += 3; // stream 3 chars at a time for speed
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [reasoning, streaming]);

  return (
    <div
      className={`bg-b100 border border-[#BFDBFE] rounded-xl ${compact ? 'p-3' : 'p-4'}`}
      role="region"
      aria-label="Agent reasoning panel"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-b500 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-13 font-semibold text-tp">{title}</span>
        </div>
        {isStreaming ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-b500 text-white text-11 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            Streaming
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-g100 text-g700 text-11 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-g500" />
            Complete
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`text-13 text-tp leading-relaxed ${compact ? 'line-clamp-4' : ''}`}>
        {displayed.split('\n\n').map((para, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : ''}>
            <RenderReasoning text={para} />
          </p>
        ))}
        {isStreaming && <span className="blink-cursor" aria-hidden="true" />}
      </div>
    </div>
  );
}
