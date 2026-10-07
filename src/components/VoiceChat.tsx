'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Participant } from '@/types/retrospective';

interface VoiceChatProps {
  peerRef: RefObject<Peer | null>;
  peerId: string;
  participants: Participant[];
}

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 320 },
  height: { ideal: 240 },
  frameRate: { ideal: 15 },
};

function MediaTile({ stream, label, muted }: { stream: MediaStream; label: string; muted?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  const hasVideo = stream.getVideoTracks().length > 0;

  return (
    <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
      {/* A <video> element also plays audio-only streams, so it is used for every tile. */}
      <video ref={ref} autoPlay playsInline muted={muted} className={hasVideo ? 'w-full h-full object-cover' : 'hidden'} />
      {!hasVideo && <span className="text-white text-2xl font-bold">{label.charAt(0).toUpperCase()}</span>}
      <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1 truncate">{label}</span>
    </div>
  );
}

export default function VoiceChat({ peerRef, peerId, participants }: VoiceChatProps) {
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [hasCam, setHasCam] = useState(false);
  const [error, setError] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotes, setRemotes] = useState<Record<string, MediaStream>>({});

  const localRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const participantsRef = useRef(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const register = (call: MediaConnection) => {
    const existing = callsRef.current.get(call.peer);
    callsRef.current.set(call.peer, call);
    if (existing && existing !== call) existing.close();

    call.on('stream', (stream) => setRemotes((prev) => ({ ...prev, [call.peer]: stream })));
    call.on('close', () => {
      if (callsRef.current.get(call.peer) !== call) return; // replaced by a newer call
      callsRef.current.delete(call.peer);
      setRemotes((prev) => {
        const next = { ...prev };
        delete next[call.peer];
        return next;
      });
    });
    call.on('error', (err) => console.error('Call error:', err));
  };

  // Answer incoming calls while we are in the voice room.
  useEffect(() => {
    const peer = peerRef.current;
    if (!joined || !peer) return;

    const onCall = (call: MediaConnection) => {
      if (!localRef.current) return;
      call.answer(localRef.current);
      register(call);
    };
    peer.on('call', onCall);
    return () => {
      peer.off('call', onCall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, peerId]);

  const stopAll = () => {
    callsRef.current.forEach((c) => c.close());
    callsRef.current.clear();
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    setLocalStream(null);
    setRemotes({});
  };

  useEffect(() => stopAll, []);

  const join = async (withVideo: boolean) => {
    const peer = peerRef.current;
    if (!peer || !peerId) {
      setError('Koneksi belum siap, coba lagi sebentar.');
      return;
    }
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: withVideo ? VIDEO_CONSTRAINTS : false,
      });
      localRef.current = stream;
      setLocalStream(stream);
      setHasCam(withVideo);
      setCamOn(withVideo);
      setMicOn(true);
      setJoined(true);

      // Call everyone already on the board; those not in voice simply won't answer,
      // and will call us themselves when they join.
      participantsRef.current
        .filter((p) => p.id !== peerId)
        .forEach((p) => register(peer.call(p.id, stream)));
    } catch (e) {
      console.error(e);
      setError('Tidak bisa mengakses mikrofon/kamera. Periksa izin browser.');
    }
  };

  const leave = () => {
    stopAll();
    setJoined(false);
    setHasCam(false);
  };

  const toggleMic = () => {
    const next = !micOn;
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  };

  const toggleCam = () => {
    const next = !camOn;
    localRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setCamOn(next);
  };

  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name || 'Peserta';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-xl">
        <CardContent className="p-3 space-y-3">
          {!joined ? (
            <div className="space-y-2">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Headphones className="w-4 h-4" /> Diskusi Online
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => join(false)}>
                  <Mic className="w-4 h-4 mr-1" /> Suara
                </Button>
                <Button size="sm" variant="secondary" onClick={() => join(true)}>
                  <Video className="w-4 h-4 mr-1" /> Suara + Kamera
                </Button>
              </div>
              {error && <p className="text-xs text-destructive max-w-52">{error}</p>}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 max-w-[24rem]">
                {localStream && <MediaTile stream={localStream} label="Anda" muted />}
                {Object.entries(remotes).map(([id, stream]) => (
                  <MediaTile key={id} stream={stream} label={nameOf(id)} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button size="icon" variant={micOn ? 'secondary' : 'destructive'} onClick={toggleMic} title="Mic">
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                {hasCam && (
                  <Button size="icon" variant={camOn ? 'secondary' : 'destructive'} onClick={toggleCam} title="Kamera">
                    {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                )}
                <Button size="icon" variant="destructive" onClick={leave} title="Keluar">
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
