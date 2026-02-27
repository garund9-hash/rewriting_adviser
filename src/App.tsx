/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Mail, 
  Briefcase, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  History
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TONES = [
  { id: 'formal', label: 'Very Formal', description: 'Strictly professional, suitable for executives or external partners.' },
  { id: 'friendly', label: 'Friendly Business', description: 'Professional but warm, good for colleagues and established clients.' },
  { id: 'urgent', label: 'Urgent/Direct', description: 'Concise and clear, emphasizing immediate action or deadlines.' },
  { id: 'apologetic', label: 'Apologetic', description: 'Sincere and professional tone for handling mistakes or delays.' },
];

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState(TONES[0].id);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{input: string, output: string, tone: string}[]>([]);

  const handleRewrite = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const toneInfo = TONES.find(t => t.id === selectedTone);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Rewrite the following text into a professional business email.
        
        Tone: ${toneInfo?.label} (${toneInfo?.description})
        
        Original Text:
        "${input}"
        
        Please provide only the email content (Subject and Body). Use a clear and professional structure.`,
        config: {
          systemInstruction: "You are a professional business communication expert. Your goal is to help users communicate effectively in a corporate environment. You transform casual or messy notes into polished, polite, and professional emails. Always include a relevant subject line.",
        }
      });

      const result = response.text || "Failed to generate content.";
      setOutput(result);
      setHistory(prev => [{ input, output: result, tone: selectedTone }, ...prev].slice(0, 5));
    } catch (error) {
      console.error("Generation error:", error);
      setOutput("Error: Could not connect to the AI service. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-[#E1E3E1] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Mail className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BizWrite</h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold opacity-80">Professional Rewriter</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#444746]">
            <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Templates</a>
            <button 
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C4C7C5] hover:bg-[#F1F3F4] transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Draft</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#444746]">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Your Draft / Notes
                </label>
                <span className="text-xs text-[#747775]">{input.length} characters</span>
              </div>
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., 'Tell John I'm late for the meeting because of traffic. Ask him to start without me and I'll be there in 15.'"
                  className="w-full h-64 p-6 bg-white border-2 border-[#E1E3E1] rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none text-lg leading-relaxed shadow-sm group-hover:border-[#C4C7C5]"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setInput('')}
                    className="p-2 text-[#747775] hover:text-red-500 transition-colors"
                    title="Clear input"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#444746]">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Select Professional Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group",
                      selectedTone === tone.id 
                        ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50" 
                        : "border-[#E1E3E1] bg-white hover:border-[#C4C7C5]"
                    )}
                  >
                    <span className={cn(
                      "font-bold text-sm mb-1",
                      selectedTone === tone.id ? "text-indigo-700" : "text-[#1A1C1E]"
                    )}>
                      {tone.label}
                    </span>
                    <span className="text-xs text-[#747775] leading-tight">
                      {tone.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={handleRewrite}
              disabled={isGenerating || !input.trim()}
              className={cn(
                "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl shadow-indigo-100",
                isGenerating || !input.trim()
                  ? "bg-[#E1E3E1] text-[#747775] cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] hover:shadow-indigo-200"
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Polishing your email...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  <span>Rewrite as Business Email</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Result & History */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#444746]">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Rewritten Result
                </label>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      copied 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-white border border-[#C4C7C5] text-[#444746] hover:bg-[#F1F3F4]"
                    )}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Email"}
                  </button>
                )}
              </div>
              
              <div className={cn(
                "flex-grow min-h-[400px] p-8 bg-white border-2 border-[#E1E3E1] rounded-2xl shadow-inner relative overflow-auto result-scroll",
                !output && "flex items-center justify-center text-center"
              )}>
                {output ? (
                  <div className="markdown-body prose prose-indigo max-w-none">
                    <ReactMarkdown>{output}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-4 opacity-40">
                    <div className="w-16 h-16 bg-[#F1F3F4] rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-[#444746]" />
                    </div>
                    <p className="text-sm font-medium">Your professional email will appear here.</p>
                  </div>
                )}
              </div>
            </section>

            {history.length > 0 && (
              <section className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#444746]">
                  <History className="w-4 h-4 text-indigo-600" />
                  Recent Drafts
                </label>
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(item.input);
                        setOutput(item.output);
                        setSelectedTone(item.tone);
                      }}
                      className="w-full p-3 bg-white border border-[#E1E3E1] rounded-xl hover:border-indigo-300 hover:bg-indigo-50/10 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="truncate pr-4">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">{item.tone}</p>
                        <p className="text-sm text-[#444746] truncate">{item.input}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C4C7C5] group-hover:text-indigo-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E1E3E1] mt-20 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 opacity-50">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tighter uppercase">BizWrite AI</span>
          </div>
          <p className="text-xs text-[#747775]">
            Powered by Gemini AI. Always review generated emails before sending to ensure accuracy and context.
          </p>
        </div>
      </footer>
    </div>
  );
}
