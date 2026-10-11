import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCw, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/auth';

interface CaptchaBoxProps {
  captchaId: string;
  onCaptchaChange: (captchaId: string, answer: string) => void;
  error?: string | null;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const CaptchaBox: React.FC<CaptchaBoxProps> = ({
  captchaId,
  onCaptchaChange,
  error,
  inputRef,
}) => {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string>(captchaId);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadCaptcha = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.fetchCaptcha();
      setCurrentId(data.captchaId);
      setImageBase64(data.imageBase64);
      setAnswer('');
      onCaptchaChange(data.captchaId, '');
    } catch {
      // Fallback local challenge
      const fallback = authService.generateLocalCaptcha();
      setCurrentId(fallback.captchaId);
      setImageBase64(fallback.imageBase64);
      setAnswer('');
      onCaptchaChange(fallback.captchaId, '');
    } finally {
      setLoading(false);
    }
  }, [onCaptchaChange]);

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setAnswer(val);
    onCaptchaChange(currentId, val);
  };

  const handlePlayAudio = async () => {
    if (playingAudio) return;
    try {
      setPlayingAudio(true);
      const audioUrl = await authService.getCaptchaAudioUrl(currentId);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setPlayingAudio(false);
        audioRef.current.onerror = () => setPlayingAudio(false);
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudio(false);
        audio.onerror = () => setPlayingAudio(false);
        audio.play();
      }
    } catch {
      setPlayingAudio(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="captcha-answer"
          className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider"
        >
          Security Verification
        </label>
        <span className="text-[11px] text-[var(--app-text-muted)]">
          Case-insensitive &bull; Single use
        </span>
      </div>

      <div className="p-3.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] space-y-3">
        {/* Captcha Image + Controls Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Captcha Image Display */}
          <div className="relative h-12 flex-1 min-w-[160px] bg-white rounded-xl border border-[var(--app-border)] overflow-hidden flex items-center justify-center shadow-xs">
            {loading ? (
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating code...</span>
              </div>
            ) : imageBase64 ? (
              <img
                src={imageBase64}
                alt="Security captcha verification challenge"
                className="w-full h-full object-contain select-none"
              />
            ) : (
              <span className="text-xs font-bold text-neutral-400">Security challenge</span>
            )}
          </div>

          {/* Action Buttons: Refresh & Audio */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePlayAudio}
              disabled={loading || playingAudio}
              className="p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)] text-[var(--app-text)] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
              aria-label="Listen to audio captcha for accessibility"
              title="Audio assistance"
            >
              {playingAudio ? (
                <VolumeX className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4 text-[var(--app-text-muted)]" />
              )}
            </button>

            <button
              type="button"
              onClick={loadCaptcha}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)] text-[var(--app-text)] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
              aria-label="Get a new captcha code"
              title="Get a new image"
            >
              <RotateCw className={`w-4 h-4 text-[var(--app-text-muted)] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div>
          <input
            id="captcha-answer"
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            required
            autoComplete="off"
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Type characters above"
            maxLength={6}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] text-sm font-black tracking-widest uppercase focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 placeholder:tracking-normal placeholder:font-normal placeholder:normal-case min-h-[44px]"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'captcha-error' : undefined}
          />
        </div>
      </div>

      {error && (
        <div id="captcha-error" className="flex items-center gap-1.5 text-xs text-red-500 font-bold" aria-live="polite">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
};
