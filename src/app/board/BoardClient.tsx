'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { THEMES, ThemeType, Feedback, RetrospectiveSession } from '@/types/retrospective';
import ThemeSelector from '@/components/ThemeSelector';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackList from '@/components/FeedbackList';
import SummaryPanel from '@/components/SummaryPanel';
import ActionItems from '@/components/ActionItems';
import StatisticsCard from '@/components/StatisticsCard';
import ExportButtons from '@/components/ExportButtons';
import { generateSummary } from '@/lib/summary-generator';
import { generateActionItems } from '@/lib/action-generator';
import { extractKeywords } from '@/lib/keyword-extractor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, Link as LinkIcon, Users as UsersIcon } from 'lucide-react';
import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

export default function BoardClient() {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');
  const isClientMode = !!roomParam;

  const [step, setStep] = useState<'setup' | 'board' | 'connecting'>(isClientMode ? 'connecting' : 'setup');
  
  // Session State
  const [teamName, setTeamName] = useState('');
  const [sprintName, setSprintName] = useState('');
  const [themeId, setThemeId] = useState<ThemeType | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [date, setDate] = useState('');

  // P2P State
  const [peerId, setPeerId] = useState<string>(''); // My ID
  const [hostId, setHostId] = useState<string>(roomParam || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [peerCount, setPeerCount] = useState(1);

  // Refs for P2P
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  const hostConnectionRef = useRef<DataConnection | null>(null);

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  // INIT PEERJS
  useEffect(() => {
    // We only initialize Peer on client side dynamically to avoid SSR issues
    const initPeer = async () => {
      const { default: PeerJs } = await import('peerjs');
      const peer = new PeerJs();
      peerRef.current = peer;

      peer.on('open', (id) => {
        setPeerId(id);
        if (isClientMode) {
          connectToHost(peer, hostId);
        }
      });

      peer.on('error', (err) => {
        console.error(err);
        setErrorMsg('P2P Error: ' + err.message);
        setStep('setup');
      });

      // If we are Host, listen for connections
      if (!isClientMode) {
        peer.on('connection', (conn) => {
          conn.on('open', () => {
            connectionsRef.current.push(conn);
            setPeerCount(connectionsRef.current.length + 1);
            
            // Send current state to new client
            conn.send({
              type: 'SYNC_STATE',
              payload: { teamName, sprintName, date, themeId, feedbacks }
            });
          });

          conn.on('data', (data: any) => {
            if (data.type === 'ADD_FEEDBACK') {
              handleNewFeedbackAsHost(data.payload);
            }
          });

          conn.on('close', () => {
            connectionsRef.current = connectionsRef.current.filter(c => c.peer !== conn.peer);
            setPeerCount(connectionsRef.current.length + 1);
          });
        });
      }
    };

    initPeer();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClientMode]); // run once based on mode

  // Client connecting to host
  const connectToHost = (peer: Peer, targetHostId: string) => {
    const conn = peer.connect(targetHostId);
    hostConnectionRef.current = conn;

    conn.on('open', () => {
      setStep('board');
    });

    conn.on('data', (data: any) => {
      if (data.type === 'SYNC_STATE') {
        const payload = data.payload;
        setTeamName(payload.teamName);
        setSprintName(payload.sprintName);
        setDate(payload.date);
        setThemeId(payload.themeId);
        setFeedbacks(payload.feedbacks);
      }
    });

    conn.on('close', () => {
      setErrorMsg('Koneksi dengan Host terputus.');
      setStep('setup'); // Fallback
    });
  };

  // Host receiving feedback from client
  const handleNewFeedbackAsHost = (feedback: Feedback) => {
    setFeedbacks(prev => {
      const newFeedbacks = [feedback, ...prev];
      broadcastState(newFeedbacks);
      return newFeedbacks;
    });
  };

  // Host broadcasting state
  const broadcastState = (currentFeedbacks: Feedback[]) => {
    const statePayload = { teamName, sprintName, date, themeId, feedbacks: currentFeedbacks };
    connectionsRef.current.forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'SYNC_STATE', payload: statePayload });
      }
    });
  };

  // Sync state changes explicitly from host UI
  useEffect(() => {
    if (!isClientMode && step === 'board') {
      broadcastState(feedbacks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamName, sprintName, date, themeId]); 

  // UI Handlers
  const handleStart = (selectedTheme: ThemeType) => {
    if (!sprintName.trim()) {
      alert('Tolong isi Sprint Name terlebih dahulu.');
      return;
    }
    setThemeId(selectedTheme);
    setStep('board');
  };

  const handleAddFeedback = (newFeedback: Omit<Feedback, 'id' | 'timestamp'>) => {
    const feedback: Feedback = {
      ...newFeedback,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    if (isClientMode) {
      // Send to host
      if (hostConnectionRef.current?.open) {
        hostConnectionRef.current.send({ type: 'ADD_FEEDBACK', payload: feedback });
      } else {
        alert('Koneksi ke host terputus.');
      }
    } else {
      // Add locally and broadcast
      handleNewFeedbackAsHost(feedback);
    }
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/board?room=${peerId}`;
    navigator.clipboard.writeText(url);
    alert('Room Link disalin ke clipboard!');
  };

  // Derived state (Simulated AI)
  const theme = themeId ? THEMES[themeId] : null;
  const summary = useMemo(() => generateSummary(feedbacks, theme), [feedbacks, theme]);
  const actionItemsList = useMemo(() => generateActionItems(feedbacks, theme), [feedbacks, theme]);
  
  const topTopics = useMemo(() => {
    const allTexts = feedbacks.map(f => `${f.category1} ${f.category2} ${f.category3}`);
    return extractKeywords(allTexts).slice(0, 5).map(k => k.word);
  }, [feedbacks]);

  const sessionData: RetrospectiveSession = {
    teamName,
    sprintName,
    date,
    theme: themeId,
    feedbacks
  };

  if (step === 'connecting') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">Connecting to Room...</h2>
        <p className="text-muted-foreground text-sm">Menghubungkan Anda ke Host ({hostId})</p>
        {errorMsg && <p className="text-destructive mt-4">{errorMsg}</p>}
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Setup Retrospective</h1>
            <p className="text-muted-foreground">Isi detail sprint dan pilih tema untuk memulai sesi sebagai Host.</p>
            {errorMsg && <p className="text-destructive font-medium">{errorMsg}</p>}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sprint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <Input 
                    value={teamName} 
                    onChange={e => setTeamName(e.target.value)} 
                    placeholder="e.g., MST Development Team" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sprint Name <span className="text-destructive">*</span></label>
                  <Input 
                    value={sprintName} 
                    onChange={e => setSprintName(e.target.value)} 
                    placeholder="e.g., Sprint 12" 
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Pilih Tema</h2>
            <ThemeSelector onSelect={handleStart} />
          </div>
        </div>
      </div>
    );
  }

  if (!theme) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-card p-4 rounded-xl shadow-sm border mb-6 gap-4">
        <div className="flex items-center gap-4">
          {!isClientMode && (
            <Button variant="ghost" size="icon" onClick={() => setStep('setup')} title="Back to Setup">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-primary">{sprintName}</h1>
              {!isClientMode && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium flex items-center gap-1">
                    Host
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full font-medium flex items-center gap-1" title="Connected Peers">
                    <UsersIcon className="w-3 h-3" /> {peerCount}
                  </span>
                </div>
              )}
              {isClientMode && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-full font-medium">
                  Participant
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {teamName ? `${teamName} • ` : ''}{date} • Tema: {theme.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isClientMode && peerId && (
            <Button variant="secondary" size="sm" onClick={copyRoomLink} className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Share Link
            </Button>
          )}
          <ExportButtons session={sessionData} summary={summary} actionItems={actionItemsList} />
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-3 space-y-6">
          <FeedbackForm theme={theme} onAddFeedback={handleAddFeedback} />
          {isClientMode && (
            <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50">
              <CardContent className="p-4 text-xs text-orange-800 dark:text-orange-300">
                Anda terhubung ke ruangan <strong>{hostId}</strong>. Data disinkronkan secara real-time dengan Host. Jangan tutup browser jika sesi belum selesai.
              </CardContent>
            </Card>
          )}
          {!isClientMode && (
            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50">
              <CardContent className="p-4 text-xs text-green-800 dark:text-green-300">
                Anda adalah <strong>Host</strong>. Bagikan link ruangan ke tim Anda agar mereka bisa mengirim feedback. Jangan tutup browser selama sesi berlangsung.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle Column: Feedback List */}
        <div className="lg:col-span-6 bg-card rounded-xl border shadow-sm p-4 flex flex-col max-h-[80vh]">
          <h2 className="text-lg font-semibold mb-4 text-foreground border-b pb-2">Board</h2>
          <FeedbackList feedbacks={feedbacks} theme={theme} />
        </div>

        {/* Right Column: AI Summary & Stats */}
        <div className="lg:col-span-3 space-y-6">
          <SummaryPanel summary={summary} />
          <ActionItems items={actionItemsList} />
          <StatisticsCard 
            totalFeedback={feedbacks.length}
            totalParticipants={new Set(feedbacks.map(f => f.authorName || 'Anonymous')).size}
            topTopics={topTopics}
          />
        </div>
      </div>
    </div>
  );
}
