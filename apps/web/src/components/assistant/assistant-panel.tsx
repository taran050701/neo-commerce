'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, SendHorizonal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAssistant } from '@/components/assistant/assistant-provider';

const MODES = [
  { id: 'faq', label: 'FAQ' },
  { id: 'product', label: 'Product' },
  { id: 'cart', label: 'Cart Recovery' },
  { id: 'returns', label: 'Returns' },
] as const;

type Mode = (typeof MODES)[number]['id'];

type AssistantHit = {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  score?: number;
};

type AssistantReply = {
  reply: string;
  mode: Mode;
  hits: AssistantHit[];
  sentiment?: string | null;
  ticket_id?: string | null;
  fallback?: boolean;
};

type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  fallback?: boolean;
};

const TABS = ['Overview', 'Matches', 'Context', 'Actions'] as const;

type Tab = (typeof TABS)[number];

export function AssistantPanel() {
  const { open, setOpen } = useAssistant();
  const [mode, setMode] = useState<Mode>('faq');
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: AssistantMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, mode }),
      });
      if (!response.ok) {
        throw new Error(`Assistant error ${response.status}`);
      }
      const data = (await response.json()) as AssistantReply;
      setReply(data);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          fallback: data.fallback,
          timestamp: Date.now(),
        },
      ]);
      if (data.fallback) {
        setActiveTab('Matches');
      } else {
        setActiveTab('Overview');
      }
    } catch (err) {
      setError('Unable to reach the assistant service.');
    } finally {
      setIsLoading(false);
    }
  };

  const overviewContent = useMemo(() => {
    if (!reply) return null;
    const normalizedMode =
      typeof reply.mode === 'string' && reply.mode.length > 0
        ? reply.mode.toUpperCase()
        : '—';
    return [
      { label: 'Sentiment', value: reply.sentiment ?? '—' },
      { label: 'Mode', value: normalizedMode },
      { label: 'Fallback', value: reply.fallback ? 'FAQ fallback used' : 'Live response' },
      { label: 'Ticket', value: reply.ticket_id ?? '—' },
    ];
  }, [reply]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber text-lg font-semibold text-slate-900 shadow-lg shadow-aurora-violet/40"
        aria-label="Toggle AI assistant"
      >
        ✦
      </button>
      <div
        className={cn(
          'fixed bottom-24 right-6 z-40 w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/90 shadow-glass backdrop-blur-2xl transition-all duration-300',
          open ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-6',
        )}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Neo Support</p>
            <h2 className="text-lg font-semibold text-slate-100">Cart & commerce copilot</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/10 p-2 text-slate-300 hover:border-aurora-teal/60 hover:text-aurora-teal"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {MODES.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={cn(
                  'rounded-full border border-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300 hover:border-aurora-teal/50 hover:text-aurora-teal',
                  mode === item.id && 'border-aurora-teal/70 text-aurora-teal',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[18rem] overflow-y-auto px-6">
          <ul className="space-y-3 text-sm">
            {messages.map((message) => (
              <li
                key={message.timestamp}
                className={cn(
                  'rounded-2xl border border-white/10 px-4 py-3 shadow-glass',
                  message.role === 'user' ? 'bg-white/10 text-slate-100' : 'bg-slate-950/70 text-slate-200',
                )}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                {message.fallback && (
                  <p className="mt-2 text-xs text-amber-300">Fallback response shown from FAQ knowledge base.</p>
                )}
              </li>
            ))}
            {!messages.length && (
              <li className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                Ask about shipping, product specs, or rescue abandoned carts.
              </li>
            )}
          </ul>
        </div>

        <div className="px-6 pt-4">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-3 py-1 uppercase tracking-[0.3em] transition-colors',
                  activeTab === tab ? 'bg-aurora-teal/20 text-aurora-teal' : 'bg-white/5 hover:bg-white/10',
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            {!reply && <p>Select a mode and ask a question to start.</p>}
            {reply && activeTab === 'Overview' && overviewContent && (
              <div className="space-y-2">
                {overviewContent.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs text-slate-300">
                    <span className="uppercase tracking-[0.3em] text-slate-500">{item.label}</span>
                    <span className="text-slate-100">{item.value}</span>
                  </div>
                ))}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{reply.reply}</p>
              </div>
            )}
            {reply && activeTab === 'Matches' && (
              <ul className="space-y-3 text-xs text-slate-300">
                {Array.isArray(reply.hits) && reply.hits.length > 0 ? (
                  reply.hits.map((hit) => (
                    <li key={hit.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
                      <p className="text-slate-100">{hit.question}</p>
                      <p className="mt-1 text-slate-300">{hit.answer}</p>
                      <div className="mt-2 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                        <span>{hit.category ?? 'General'}</span>
                        {typeof hit.score === 'number' && <span>{(hit.score * 100).toFixed(1)}%</span>}
                      </div>
                    </li>
                  ))
                ) : (
                  <li>No matches returned.</li>
                )}
              </ul>
            )}
            {reply && activeTab === 'Context' && (
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-slate-300">
                {JSON.stringify(reply, null, 2)}
              </pre>
            )}
            {reply && activeTab === 'Actions' && (
              <div className="space-y-3 text-sm">
                <p className="text-slate-200">Suggested follow-ups:</p>
                <ul className="space-y-2 text-xs text-aurora-teal">
                  <li>• Create a support ticket if the user is unhappy.</li>
                  <li>• Offer a recovery coupon if sentiment is negative.</li>
                  <li>• Attach the top matching FAQ to the chat transcript.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2 border-t border-white/10 px-6 py-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            placeholder="Ask about shipping, a product spec, or recover a cart…"
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-aurora-teal focus:outline-none"
          />
          {error && <p className="text-xs text-aurora-amber">{error}</p>}
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aurora-violet via-aurora-teal to-aurora-amber px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow shadow-aurora-violet/40 transition-transform hover:-translate-y-[1px] disabled:opacity-40"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </>
        ) : (
          <>
            Send
            <SendHorizonal className="h-4 w-4" />
          </>
        )}
      </button>
        </form>
      </div>
    </>
  );
}
