import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatDuration } from '../utils';
import styles from './MessageThread.module.css';

interface VoiceMessagePlayerProps {
  src: string;
  storedDurationSeconds: number | null;
  isOwn: boolean;
}

let currentlyPlaying: HTMLAudioElement | null = null;

function barCountFor(durationSeconds: number): number {
  const estimated = Math.round(Math.max(durationSeconds, 1) * 8);
  return Math.min(60, Math.max(24, estimated));
}

async function decodeWaveform(arrayBuffer: ArrayBuffer, barCount: number): Promise<number[]> {
  const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return [];

  const audioContext = new AudioContextCtor();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / barCount));
    const peaks: number[] = [];
    for (let bar = 0; bar < barCount; bar += 1) {
      const start = bar * blockSize;
      let max = 0;
      for (let i = 0; i < blockSize; i += 1) {
        const value = Math.abs(channelData[start + i] ?? 0);
        if (value > max) max = value;
      }
      peaks.push(max);
    }
    const peakMax = Math.max(...peaks, 0.01);
    return peaks.map((peak) => Math.max(0.18, peak / peakMax));
  } finally {
    audioContext.close().catch(() => {});
  }
}

export function VoiceMessagePlayer({ src, storedDurationSeconds, isOwn }: VoiceMessagePlayerProps) {
  const { t } = useTranslation('messaging');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (audioRef.current === null) {
    audioRef.current = new Audio();
  }
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(storedDurationSeconds ?? 0);
  const [waveform, setWaveform] = useState<number[] | null>(null);

  useEffect(() => {
    const audio = audioRef.current!;
    audio.src = src;
    audio.preload = 'metadata';

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleLoadedMetadata = () => {
      if (storedDurationSeconds != null) return;
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    let cancelled = false;
    const barCount = barCountFor(storedDurationSeconds ?? 8);
    fetch(src, { credentials: 'include' })
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('failed to fetch voice message'))))
      .then((arrayBuffer) => decodeWaveform(arrayBuffer, barCount))
      .then((peaks) => {
        if (!cancelled) setWaveform(peaks.length > 0 ? peaks : new Array(barCount).fill(0.3));
      })
      .catch(() => {
        if (!cancelled) setWaveform(new Array(barCount).fill(0.3));
      });

    return () => {
      cancelled = true;
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      if (currentlyPlaying === audio) currentlyPlaying = null;
    };
  }, [src, storedDurationSeconds]);

  const togglePlay = () => {
    const audio = audioRef.current!;
    if (playing) {
      audio.pause();
      return;
    }
    if (currentlyPlaying && currentlyPlaying !== audio) {
      currentlyPlaying.pause();
    }
    currentlyPlaying = audio;
    audio.play().catch(() => {});
  };

  const handleSeek = (event: React.PointerEvent<HTMLDivElement>) => {
    const audio = audioRef.current!;
    if (!duration) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    audio.currentTime = fraction * duration;
    setCurrentTime(audio.currentTime);
  };

  const bars = waveform ?? new Array(barCountFor(storedDurationSeconds ?? 8)).fill(0.3);
  const playedFraction = duration > 0 ? currentTime / duration : 0;
  const displaySeconds = playing || currentTime > 0 ? currentTime : duration;

  return (
    <div
      className={cn(styles.voicePlayer, isOwn ? styles.voicePlayerOwn : styles.voicePlayerOther)}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={styles.voicePlayerButton}
        onClick={(event) => {
          event.stopPropagation();
          togglePlay();
        }}
        aria-label={t(playing ? 'MessageBubble.pauseVoice' : 'MessageBubble.playVoice')}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div
        className={styles.voiceWaveform}
        onPointerDown={(event) => {
          event.stopPropagation();
          handleSeek(event);
        }}
      >
        {bars.map((peak, index) => (
          <span
            key={index}
            className={cn(styles.voiceWaveformBar, index / bars.length < playedFraction && styles.voiceWaveformBarPlayed)}
            style={{ height: `${Math.round(peak * 100)}%` }}
          />
        ))}
      </div>
      <span className={styles.voiceDuration}>{formatDuration(displaySeconds)}</span>
    </div>
  );
}
