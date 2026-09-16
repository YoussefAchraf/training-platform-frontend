import { useCallback, useRef, useState } from 'react';

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
const LEVEL_HISTORY_SIZE = 32;
const LEVEL_SAMPLE_INTERVAL_MS = 100;

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return null;
}

function readLevel(analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>): number {
  analyser.getByteTimeDomainData(buffer);
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const normalized = (buffer[i] - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const rms = Math.sqrt(sumSquares / buffer.length);
  return Math.min(1, rms * 4);
}

export type VoiceRecorderStatus = 'idle' | 'unsupported' | 'permission-denied' | 'recording';

export interface RecordedVoice {
  blob: Blob;
  durationSeconds: number;
  mimeType: string;
}

export function useVoiceRecorder() {
  const [status, setStatus] = useState<VoiceRecorderStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => new Array(LEVEL_HISTORY_SIZE).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');
  const elapsedRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelHistoryRef = useRef<number[]>(new Array(LEVEL_HISTORY_SIZE).fill(0));

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (levelTimerRef.current) {
      clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }
    analyserRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    levelHistoryRef.current = new Array(LEVEL_HISTORY_SIZE).fill(0);
    setLevels(levelHistoryRef.current);
  }, []);

  const start = useCallback(async () => {
    const mimeType = pickSupportedMimeType();
    if (!mimeType || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mimeTypeRef.current = mimeType;
      chunksRef.current = [];
      elapsedRef.current = 0;
      setElapsedSeconds(0);

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSeconds(elapsedRef.current);
      }, 1000);

      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextCtor) {
        const audioContext = new AudioContextCtor();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.fftSize);
        levelHistoryRef.current = new Array(LEVEL_HISTORY_SIZE).fill(0);
        levelTimerRef.current = setInterval(() => {
          const level = readLevel(analyser, buffer);
          levelHistoryRef.current = [...levelHistoryRef.current.slice(1), level];
          setLevels(levelHistoryRef.current);
        }, LEVEL_SAMPLE_INTERVAL_MS);
      }
    } catch {
      setStatus('permission-denied');
      cleanup();
    }
  }, [cleanup]);

  const stop = useCallback((): Promise<RecordedVoice | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        const durationSeconds = elapsedRef.current;
        cleanup();
        setStatus('idle');
        resolve({ blob, durationSeconds, mimeType: mimeTypeRef.current });
      };
      recorder.stop();
    });
  }, [cleanup]);

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    cleanup();
    setStatus('idle');
    setElapsedSeconds(0);
    elapsedRef.current = 0;
  }, [cleanup]);

  return { status, elapsedSeconds, levels, start, stop, cancel };
}
