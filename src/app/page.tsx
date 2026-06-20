'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Zap, LayoutTemplate } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
            Sprint <span className="text-primary">Retrospective</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Reflect, Improve, Grow
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8 space-y-6">
          <Link href="/board">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              Create New Room
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">OR</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form 
            className="flex items-center justify-center max-w-sm mx-auto gap-2"
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
              placeholder="Paste Room ID here..." 
              className="flex h-12 w-full rounded-full border border-input bg-transparent px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <Button type="submit" variant="secondary" className="h-12 rounded-full px-6">
              Join
            </Button>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Setup Required</h3>
            <p className="text-sm text-muted-foreground text-center">Start immediately without creating an account or database connection.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Multiple Themes</h3>
            <p className="text-sm text-muted-foreground text-center">Choose from Professional, Sailboat, Start/Stop/Continue, and more.</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Summaries</h3>
            <p className="text-sm text-muted-foreground text-center">Auto-generate AI-like summaries and action items on the fly.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
