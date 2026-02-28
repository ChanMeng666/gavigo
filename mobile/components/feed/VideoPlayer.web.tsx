// Web-specific VideoPlayer — uses raw HTML <video> element for reliable
// fullscreen rendering. Bypasses expo-av which fights CSS on web.
import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  contentId: string;
  isVisible: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export function VideoPlayer({
  contentId,
  isVisible,
  videoUrl,
  thumbnailUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // start muted for autoplay
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const heartTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible && isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible, isPlaying]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setHasStarted(true);
    };
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (!next) {
        setShowPauseIcon(true);
        clearTimeout(pauseTimerRef.current);
      } else {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(
          () => setShowPauseIcon(false),
          600
        );
      }
      return next;
    });
  }, []);

  const triggerHeart = useCallback(() => {
    setShowHeart(true);
    clearTimeout(heartTimerRef.current);
    heartTimerRef.current = setTimeout(() => setShowHeart(false), 800);
  }, []);

  const handleClick = useCallback(() => {
    // Unmute on first user interaction (browser autoplay policy)
    if (isMuted) {
      setIsMuted(false);
      if (videoRef.current) videoRef.current.muted = false;
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeSinceLastTap < 300) {
      // Double tap → like
      triggerHeart();
    } else {
      // Delay single tap to distinguish from double tap
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 280) {
          togglePlay();
        }
      }, 300);
    }
  }, [togglePlay, triggerHeart, isMuted]);

  // No video URL — placeholder
  if (!videoUrl) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0e0e18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Ionicons name="videocam-off-outline" size={48} color="#555568" />
        <Text style={{ color: '#555568', marginTop: 8, fontSize: 14 }}>
          Video unavailable
        </Text>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0e0e18',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail poster — visible until video starts */}
      {thumbnailUrl && !hasStarted && (
        <img
          src={thumbnailUrl}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />
      )}

      {/* HTML5 video element — full control, no expo-av wrapper */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Buffering spinner */}
      {isBuffering && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 2,
          }}
        >
          <ActivityIndicator color="#7c3aed" size="large" />
        </div>
      )}

      {/* Pause/play indicator */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 3,
          opacity: showPauseIcon ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isPlaying ? 'play' : 'pause'}
            size={32}
            color="white"
          />
        </div>
      </div>

      {/* Double-tap heart */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 4,
          opacity: showHeart ? 1 : 0,
          transform: showHeart ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <Ionicons name="heart" size={80} color="#f87171" />
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: 'rgba(255,255,255,0.15)',
          zIndex: 5,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#fff',
            borderRadius: 1,
            transition: 'width 0.2s linear',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#fff',
            top: -2,
            left: `${progress}%`,
            marginLeft: -3,
            transition: 'left 0.2s linear',
          }}
        />
      </div>
    </div>
  );
}
