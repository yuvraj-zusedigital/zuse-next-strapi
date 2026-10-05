"use client";

import { useState, useRef, useEffect } from "react";
import { PlayIcon } from "@/components/icons/play";
import { PauseIcon } from "@/components/icons/pause";

interface AudioPlayerProps {
  url: string;
  autoPlay?: boolean;
  onPause?: () => void;
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function AudioPlayer({ url, autoPlay = false, onPause }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onPause) onPause();
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    if (autoPlay) {
      audio.play().catch((err) => console.log("Autoplay blocked:", err));
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [url, autoPlay, onPause]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      if (onPause) onPause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="flex items-center gap-3 p-[5px] pr-5 border border-border-100 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-[320px] w-full min-w-[200px]">
      <audio ref={audioRef} src={url} preload="metadata" />
      
      <button 
        onClick={togglePlayPause}
        className="w-[34px] h-[34px] rounded-full bg-surface-100 flex items-center justify-center text-ink-900 hover:bg-surface-200 transition-colors shrink-0"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2V10M8 2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-0.5">
            <path d="M3.5 2.5L9.5 6L3.5 9.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 relative flex items-center h-full">
        {/* Progress Bar background */}
        <div className="absolute left-0 right-0 h-[2px] bg-brand-100 rounded-full overflow-hidden pointer-events-none">
          <div 
            className="h-full bg-brand-400 transition-all duration-75"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        {/* Range Input for seeking */}
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Custom Thumb */}
        <div 
          className="absolute w-3 h-3 bg-white border-[2.5px] border-brand-400 rounded-full pointer-events-none transition-all duration-75 -ml-1.5"
          style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      <div className="text-brand-400 text-[13px] font-medium min-w-[32px] text-right shrink-0">
        {formatTime(currentTime)}
      </div>
    </div>
  );
}
