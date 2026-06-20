'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Zap, LayoutTemplate, Sparkles, PlayCircle } from 'lucide-react';

export default function LandingPage() {
  const [savedSession, setSavedSession] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mst-retro-session');
      if (saved) {
        setSavedSession(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved session');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 w-full h-[500px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      
      <div className="max-w-4xl w-full text-center space-y-12 p-6 z-10">
        
        {/* Header Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Retrospective 2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
            Sprint <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Retrospective</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Evaluasi kolaboratif kelas atas tanpa ribet. Mulai sinkronisasi *real-time* dengan tim Anda dalam hitungan detik.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-6 space-y-8 flex flex-col items-center">
          
          {savedSession && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link href="/board">
                <Button size="lg" variant="outline" className="text-primary border-primary/50 hover:bg-primary/10 px-8 py-6 rounded-full shadow-lg font-bold">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Resume: {savedSession.sprintName}
                </Button>
              </Link>
            </div>
          )}

          <Link href="/board">
            <Button size="lg" className="text-lg px-10 py-7 rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-500">
              Create New Room
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-4 w-full max-w-md">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-semibold">Atau Gabung</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form 
            className="flex items-center w-full max-w-md gap-3 bg-white/60 dark:bg-slate-900/60 p-2 rounded-full border shadow-sm backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const room = formData.get('room');
              if (room) {
                window.location.href = `/board?room=${room}`;
              }
            }}
          >
            <input 
              name="room"
              type="text" 
              placeholder="Paste Room ID di sini..." 
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground font-medium"
              required
            />
            <Button type="submit" variant="secondary" className="rounded-full px-6 font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              Join
            </Button>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="group flex flex-col items-center p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-slate-100">Instan & Cepat</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center font-medium leading-relaxed">Tanpa login, tanpa database. Mulai seketika dan data tersinkron secara *Peer-to-Peer*.</p>
          </div>
          
          <div className="group flex flex-col items-center p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
              <LayoutTemplate className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-slate-100">Premium Board</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center font-medium leading-relaxed">Tampilan Kanban Board interaktif yang memanjakan mata, lengkap dengan fitur diskusi per-poin.</p>
          </div>

          <div className="group flex flex-col items-center p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-slate-100">AI Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center font-medium leading-relaxed">Secara cerdas merangkum percakapan Anda dan membuat daftar Action Items otomatis.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
