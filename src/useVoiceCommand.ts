import { useState, useRef, useCallback } from 'react';
import { CROPS, VOICE_ALIASES } from '@/data';
import type { Crop, Lang } from '@/types';

interface VoiceMatch {
  crop: Crop;
  quantity: number;
  transcript: string;
}

export function useVoiceCommand(lang: Lang, fallbackQuantity: number) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef<unknown>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const closeOverlay = useCallback(() => {
    setIsVoiceActive(false);
    clearTimeout();
    recognitionRef.current = null;
  }, []);

  const parseTranscript = useCallback(
    (transcript: string): VoiceMatch => {
      const normalized = transcript.toLowerCase();
      const matchedEntry = Object.entries(VOICE_ALIASES).find(([, aliases]) =>
        aliases.some((alias) => normalized.includes(alias.toLowerCase())),
      );
      const crop = CROPS.find((c) => c.id === matchedEntry?.[0]) ?? CROPS[0];
      const quantityMatch = transcript.match(/\d{1,4}/);
      const quantity = quantityMatch ? Math.max(20, Number(quantityMatch[0])) : fallbackQuantity;
      return { crop, quantity, transcript };
    },
    [fallbackQuantity],
  );

  const applyResult = useCallback(
    (transcript: string, onMatch: (match: VoiceMatch) => void) => {
      const match = parseTranscript(transcript);
      setVoiceMessage(`✓ पहचाना: "${transcript}" → ${match.crop.name.en}, ${match.quantity} bags`);
      onMatch(match);
      timeoutRef.current = window.setTimeout(() => closeOverlay(), 1500);
    },
    [parseTranscript, closeOverlay],
  );

  const startListening = useCallback(
    (onMatch: (match: VoiceMatch) => void) => {
      closeOverlay();

      const w = window as Window & {
        SpeechRecognition?: new () => unknown;
        webkitSpeechRecognition?: new () => unknown;
      };
      const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;

      setIsVoiceActive(true);
      setVoiceMessage('सुन रहा हूँ... बोलिए जैसे "200 बोरी गाजर" या "100 bags grapes"');

      if (!ctor) {
        setVoiceMessage(
          'Voice recognition not supported on this browser. Type your command below.',
        );
        return;
      }

      interface SpeechRecognitionLike {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        continuous: boolean;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: (event: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      }

      const recognition = new ctor() as SpeechRecognitionLike;
      recognitionRef.current = recognition;
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      let gotResult = false;

      recognition.onresult = (event) => {
        gotResult = true;
        const transcript = event.results[0][0].transcript;
        applyResult(transcript, onMatch);
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        setVoiceMessage(
          `Voice error: ${event.error}. You can type your command below instead.`,
        );
      };

      recognition.onend = () => {
        if (!gotResult && recognitionRef.current !== null) {
          setVoiceMessage(
            'कोई आवाज नहीं सुनाई दी। Type your command below or try again.',
          );
        }
      };

      timeoutRef.current = window.setTimeout(() => {
        if (!gotResult) {
          try {
            recognition.stop();
          } catch {
            /* already stopped */
          }
          setVoiceMessage(
            'समय समाप्त। No speech detected. Type your command below or try again.',
          );
          timeoutRef.current = window.setTimeout(() => closeOverlay(), 4000);
        }
      }, 8000);

      try {
        recognition.start();
      } catch {
        setVoiceMessage('Could not start microphone. Type your command below.');
      }
    },
    [lang, closeOverlay, applyResult],
  );

  const applyTextCommand = useCallback(
    (text: string, onMatch: (match: VoiceMatch) => void) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      applyResult(trimmed, onMatch);
    },
    [applyResult],
  );

  return {
    isVoiceActive,
    voiceMessage,
    startListening,
    closeOverlay,
    applyTextCommand,
  };
}
