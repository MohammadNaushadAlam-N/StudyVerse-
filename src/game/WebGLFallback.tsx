/**
 * StudyVerse 10 — 2D WebGL Fallback Academy Map
 * Guaranteed graceful degradation if WebGL is unavailable or GPU context is lost.
 */

import React from 'react';
import { CHAPTER_PORTALS_CONFIG } from './HubScene.ts';
import { Sparkles, Lock, ArrowRight, AlertCircle, Compass } from 'lucide-react';

interface WebGLFallbackProps {
  onSelectChapter: (chapterId: string) => void;
  onLockedChapterClick: (title: string) => void;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({
  onSelectChapter,
  onLockedChapterClick,
}) => {
  return (
    <div className="w-full h-full min-h-[600px] bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="max-w-4xl w-full space-y-6">
        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4 flex items-start space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-cyan-300">2D Academy Fallback Mode Active</h3>
            <p className="text-slate-300 mt-0.5">
              WebGL 3D graphics are currently in 2D schematic mode. All chapter laboratories, interactive simulations, and learning missions are 100% accessible below.
            </p>
          </div>
        </div>

        {/* Central 2D Academy Courtyard Map */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Central Academy Courtyard (Schematic Map)</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">1 Active Portal &middot; 12 Locked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHAPTER_PORTALS_CONFIG.map((portal) => (
              <div
                key={portal.chapterId}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  portal.status === 'active'
                    ? 'bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40 cursor-pointer hover:scale-[1.02]'
                    : 'bg-slate-900/40 border-slate-800 opacity-75'
                }`}
                onClick={() => {
                  if (portal.status === 'active') {
                    onSelectChapter(portal.chapterId);
                  } else {
                    onLockedChapterClick(portal.title);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    Chapter {portal.chapterNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border flex items-center space-x-1 ${
                      portal.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {portal.status === 'active' ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Active Mission</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">{portal.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{portal.description}</p>

                {portal.status === 'active' && (
                  <button className="mt-3 w-full inline-flex items-center justify-center space-x-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
                    <span>Enter 3D Reaction Lab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
