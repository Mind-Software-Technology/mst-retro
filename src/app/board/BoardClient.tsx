'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { THEMES, ThemeType, Feedback, RetrospectiveSession, Participant, Note } from '@/types/retrospective';
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
  const [savedSession, setSavedSession] = useState<any>(null);

  // P2P State
  const [peerId, setPeerId] = useState<string>(''); // My ID
  const [hostId, setHostId] = useState<string>(roomParam || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [peerCount, setPeerCount] = useState(1);

  // User & Participants State
  const [myName, setMyName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Refs for P2P
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  const hostConnectionRef = useRef<DataConnection | null>(null);

  // Ref for fresh state access in P2P callbacks
  const stateRef = useRef({ teamName, sprintName, date, themeId, feedbacks, participants });
  useEffect(() => {
    stateRef.current = { teamName, sprintName, date, themeId, feedbacks, participants };
  }, [teamName, sprintName, date, themeId, feedbacks, participants]);

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
    
    // Check for saved session
    if (!isClientMode) {
      try {
        const saved = localStorage.getItem('mst-retro-session');
        if (saved) {
          setSavedSession(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse saved session');
      }
    }
  }, [isClientMode]);

  // INIT PEERJS
  const initPeer = async (customId?: string) => {
    const { default: PeerJs } = await import('peerjs');

    const localPeer = customId ? new PeerJs(customId) : new PeerJs();
    peerRef.current = localPeer;

    localPeer.on('open', (id) => {
      setPeerId(id);
      if (isClientMode) {
        connectToHost(localPeer, hostId);
      }
    });

    localPeer.on('error', (err: any) => {
      console.error(err);
      
      // Jika Host mencoba resume tapi ID lama masih nyangkut di server PeerJS
      if (err.type === 'unavailable-id') {
        alert('Tautan ruangan sebelumnya masih "nyangkut" di server. Sistem otomatis membuatkan tautan baru. Data Anda tetap aman!');
        initPeer(); // Panggil ulang tanpa customId
        return;
      }

      setErrorMsg('P2P Error: ' + err.message);
      setStep('setup');
    });

    // If we are Host, listen for connections
    if (!isClientMode) {
      localPeer.on('connection', (conn) => {
        conn.on('open', () => {
          connectionsRef.current.push(conn);
          setPeerCount(connectionsRef.current.length + 1);
        });

        conn.on('data', (data: any) => {
          if (data.type === 'REQUEST_SYNC') {
            conn.send({
              type: 'SYNC_STATE',
              payload: stateRef.current
            });
          } else if (data.type === 'ADD_FEEDBACK') {
            handleNewFeedbackAsHost(data.payload);
          } else if (data.type === 'UPDATE_NAME') {
            setParticipants(prev => {
              const existing = prev.find(p => p.id === data.payload.id);
              if (existing) {
                return prev.map(p => p.id === data.payload.id ? { ...p, name: data.payload.name } : p);
              }
              return [...prev, { id: data.payload.id, name: data.payload.name, isHost: false }];
            });
          } else if (data.type === 'ADD_NOTE') {
            handleAddNoteAsHost(data.payload.feedbackId, data.payload.note);
          }
        });

        conn.on('close', () => {
          connectionsRef.current = connectionsRef.current.filter(c => c.peer !== conn.peer);
          setPeerCount(connectionsRef.current.length + 1);
          setParticipants(prev => prev.filter(p => p.id !== conn.peer));
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
        });
      });
    }
  };

  useEffect(() => {
    if (isClientMode) {
      initPeer();
    }
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClientMode]);

  // Client connecting to host
  const connectToHost = (peer: Peer, targetHostId: string) => {
    const conn = peer.connect(targetHostId, { reliable: true });
    hostConnectionRef.current = conn;

    const timeout = setTimeout(() => {
      if (step !== 'board') {
        setErrorMsg('Gagal terhubung. Pastikan Host masih online di halamannya dan jaringan tidak memblokir WebRTC (Firewall/VPN).');
        setStep('setup');
      }
    }, 15000); // 15 seconds timeout

    conn.on('open', () => {
      clearTimeout(timeout);
      // Request initial state from host
      conn.send({ type: 'REQUEST_SYNC' });
    });

    conn.on('data', (data: any) => {
      if (data.type === 'SYNC_STATE') {
        const payload = data.payload;
        setTeamName(payload.teamName);
        setSprintName(payload.sprintName);
        setDate(payload.date);
        setThemeId(payload.themeId);
        setFeedbacks(payload.feedbacks || []);
        setParticipants(payload.participants || []);
        setStep('board'); // Move to board ONLY after getting data
      }
    });

    conn.on('close', () => {
      clearTimeout(timeout);
      setErrorMsg('Koneksi dengan Host terputus.');
      setStep('setup'); // Fallback
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Conn Error:', err);
      setErrorMsg('Koneksi Error: ' + err.message);
      setStep('setup');
    });
  };

  // Host receiving feedback from client
  const handleNewFeedbackAsHost = (feedback: Feedback) => {
    setFeedbacks(prev => {
      const newFeedbacks = [feedback, ...prev];
      broadcastState({ feedbacks: newFeedbacks });
      return newFeedbacks;
    });
  };

  // Host broadcasting state
  const broadcastState = (currentState: Partial<typeof stateRef.current>) => {
    const statePayload = { ...stateRef.current, ...currentState };
    connectionsRef.current.forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'SYNC_STATE', payload: statePayload });
      }
    });
  };

  // Host adding a note
  const handleAddNoteAsHost = (feedbackId: string, note: Note) => {
    setFeedbacks(prev => {
      const newFeedbacks = prev.map(f => {
        if (f.id === feedbackId) {
          return { ...f, notes: [...(f.notes || []), note] };
        }
        return f;
      });
      broadcastState({ feedbacks: newFeedbacks });
      return newFeedbacks;
    });
  };

  // Sync state changes explicitly from host UI and auto-save
  useEffect(() => {
    if (!isClientMode && step === 'board') {
      broadcastState({});
      
      // Auto-save to LocalStorage
      if (peerId) {
        const sessionToSave = {
          peerId,
          teamName,
          sprintName,
          date,
          themeId,
          feedbacks,
          participants
        };
        localStorage.setItem('mst-retro-session', JSON.stringify(sessionToSave));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamName, sprintName, date, themeId, participants, feedbacks, peerId, step, isClientMode]);

  // Update participant name
  useEffect(() => {
    if (peerId && step === 'board') {
      if (isClientMode) {
        if (hostConnectionRef.current?.open) {
          hostConnectionRef.current.send({ type: 'UPDATE_NAME', payload: { id: peerId, name: isAnonymous ? 'Anonymous' : myName } });
        }
      } else {
        setParticipants(prev => {
          const nameToUse = isAnonymous ? 'Anonymous Host' : (myName || 'Host');
          const existing = prev.find(p => p.id === peerId);
          if (existing) {
            return prev.map(p => p.id === peerId ? { ...p, name: nameToUse } : p);
          }
          return [...prev, { id: peerId, name: nameToUse, isHost: true }];
        });
      }
    }
  }, [myName, isAnonymous, peerId, step, isClientMode]);

  // UI Handlers
  const handleStart = (selectedTheme: ThemeType) => {
    if (!sprintName.trim()) {
      alert('Tolong isi Sprint Name terlebih dahulu.');
      return;
    }
    // Delete any old saved session
    localStorage.removeItem('mst-retro-session');
    
    setThemeId(selectedTheme);
    initPeer(); // Generate new random ID
    setStep('board');
  };

  const handleResume = () => {
    if (savedSession) {
      setTeamName(savedSession.teamName);
      setSprintName(savedSession.sprintName);
      setDate(savedSession.date);
      setThemeId(savedSession.themeId);
      setFeedbacks(savedSession.feedbacks || []);
      // We don't restore participants, they have to reconnect
      setParticipants([]);
      
      initPeer(savedSession.peerId); // Re-use old ID so links work
      setStep('board');
    }
  };

  const handleAddFeedback = (newFeedback: Omit<Feedback, 'id' | 'timestamp' | 'notes'>) => {
    const feedback: Feedback = {
      ...newFeedback,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      notes: [],
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

  const handleAddNote = (feedbackId: string, text: string) => {
    const note: Note = {
      id: crypto.randomUUID(),
      authorName: isAnonymous ? 'Anonymous' : (myName || 'Unknown'),
      text,
      timestamp: Date.now()
    };

    if (isClientMode) {
      if (hostConnectionRef.current?.open) {
        hostConnectionRef.current.send({ type: 'ADD_NOTE', payload: { feedbackId, note } });
      }
    } else {
      handleAddNoteAsHost(feedbackId, note);
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
    const allTexts = feedbacks.map(f => f.content);
    return extractKeywords(allTexts).slice(0, 5).map(k => k.word);
  }, [feedbacks]);

  const sessionData: RetrospectiveSession = {
    teamName,
    sprintName,
    date,
    theme: themeId,
    feedbacks,
    participants
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

          {savedSession && (
            <Card className="border-primary/50 shadow-lg shadow-primary/5 bg-primary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-primary">Sesi Sebelumnya Ditemukan</h3>
                  <p className="text-sm text-muted-foreground">Anda memiliki ruangan yang belum selesai: <strong>{savedSession.sprintName}</strong> ({savedSession.feedbacks?.length || 0} feedback).</p>
                </div>
                <Button onClick={handleResume} size="lg" className="w-full sm:w-auto font-bold shrink-0">
                  Lanjutkan Sesi Ini
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sprint Details {savedSession && <span className="text-sm font-normal text-muted-foreground ml-2">(Atau Buat Baru)</span>}</CardTitle>
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

  if (!theme) {
    if (step === 'board') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Menyinkronkan Data...</h2>
          <p className="text-muted-foreground text-sm">Menunggu data awal dari Host.</p>
        </div>
      );
    }
    return null;
  }

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
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-24">
        
        {/* Left Column: Form & Info */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          <FeedbackForm 
            theme={theme} 
            onAddFeedback={handleAddFeedback} 
            myName={myName}
            setMyName={setMyName}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
          />
          {isClientMode ? (
            <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50">
              <CardContent className="p-4 text-xs text-orange-800 dark:text-orange-300">
                Anda terhubung ke ruangan <strong>{hostId}</strong>. Data disinkronkan secara real-time dengan Host.
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50">
              <CardContent className="p-4 text-xs text-green-800 dark:text-green-300">
                Anda adalah <strong>Host</strong>. Bagikan link ruangan ke tim Anda agar mereka bisa mengirim feedback. Jangan tutup browser selama sesi berlangsung.
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <SummaryPanel summary={summary} />
            <ActionItems items={actionItemsList} />
          </div>
        </div>

        {/* Middle/Right Column: Kanban Board */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-border/60 p-4">
          <FeedbackList 
            feedbacks={feedbacks} 
            theme={theme} 
            onAddNote={handleAddNote} 
            myName={myName} 
          />
        </div>
      </div>

      {/* Participants Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-muted/50 p-1.5 rounded-full">
             <UsersIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex -space-x-2">
            {participants.map((p, i) => (
              <div 
                key={p.id} 
                className="w-8 h-8 rounded-full text-white border-2 border-background flex items-center justify-center text-xs font-bold ring-2 ring-transparent hover:ring-primary/50 hover:-translate-y-1 hover:z-50 transition-all cursor-help shadow-sm"
                title={`${p.name} ${p.isHost ? '(Host)' : ''}`}
                style={{ zIndex: participants.length - i, backgroundColor: `hsl(${(i * 45) % 360}, 70%, 45%)` }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-sm font-semibold ml-1">{participants.length} Orang Terhubung</span>
        </div>
        <div className="h-4 w-px bg-border mx-2"></div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Live
        </div>
      </div>
    </div>
  );
}
