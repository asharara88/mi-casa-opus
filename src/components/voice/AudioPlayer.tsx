import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string | null;
  isLoading?: boolean;
  onDownload?: () => void;
  className?: string;
  showDownload?: boolean;
  voiceName?: string;
  generatedAt?: string;
}

export function AudioPlayer({
  src,
  isLoading = false,
  onDownload,
  className,
  showDownload = true,
  voiceName,
  generatedAt,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (src) {
      audioRef.current = new Audio(src);
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        audioRef.current?.pause();
        audioRef.current = null;
      };
    }
  }, [src]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={cn('p-4 rounded-lg border bg-muted/50', className)}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Generating audio...</span>
        </div>
      </div>
    );
  }

  if (!src) {
    return null;
  }

  return (
    <div className={cn('p-4 rounded-lg border bg-card', className)}>
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10 shrink-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        {/* Download Button */}
        {showDownload && onDownload && (
          <Button
            variant="outline"
            size="icon"
            onClick={onDownload}
            className="h-8 w-8"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Metadata */}
      {(voiceName || generatedAt) && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          {voiceName && <span>Voice: {voiceName}</span>}
          {generatedAt && <span>Generated: {generatedAt}</span>}
        </div>
      )}
    </div>
  );
}
