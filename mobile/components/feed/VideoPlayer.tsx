import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface VideoPlayerProps {
  contentId: string;
  isVisible: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export function VideoPlayer({ contentId, isVisible, videoUrl, thumbnailUrl }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const pauseIndicatorOpacity = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible && isPlaying) {
      videoRef.current?.playAsync().catch(() => {});
    } else {
      videoRef.current?.pauseAsync().catch(() => {});
    }
  }, [isVisible, isPlaying]);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setIsBuffering(status.isBuffering ?? false);
        if (status.durationMillis) {
          setProgress(
            (status.positionMillis / status.durationMillis) * 100
          );
        }
        if (status.didJustFinish) {
          videoRef.current?.replayAsync().catch(() => {});
        }
      }
    },
    []
  );

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (!next) {
        pauseIndicatorOpacity.value = withTiming(1, { duration: 200 });
      } else {
        pauseIndicatorOpacity.value = withDelay(
          200,
          withTiming(0, { duration: 500 })
        );
      }
      return next;
    });
  }, [pauseIndicatorOpacity]);

  const triggerDoubleTapLike = useCallback(() => {
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );
    heartOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(300, withTiming(0, { duration: 500 }))
    );
  }, [heartScale, heartOpacity]);

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(togglePlay)();
    });

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(triggerDoubleTapLike)();
    });

  const gesture = Gesture.Exclusive(doubleTap, singleTap);

  const pauseStyle = useAnimatedStyle(() => ({
    opacity: pauseIndicatorOpacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  const progressKnobLeft = `${progress}%`;

  // No video URL — show placeholder
  if (!videoUrl) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0e0e18',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="videocam-off-outline" size={48} color="#555568" />
        <Text style={{ color: '#555568', marginTop: 8, fontSize: 14 }}>
          Video unavailable
        </Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0e0e18',
          overflow: 'hidden',
        }}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
          usePoster={!!thumbnailUrl}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={false}
          shouldPlay={isVisible && isPlaying}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' } as any}
        />

        {/* Buffering overlay */}
        {isBuffering && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <ActivityIndicator color="#7c3aed" size="large" />
          </View>
        )}

        {/* Pause indicator */}
        <Animated.View
          style={[
            pauseStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <View className="h-16 w-16 rounded-full bg-black/30 items-center justify-center">
            <Ionicons name="play" size={32} color="white" />
          </View>
        </Animated.View>

        {/* Double-tap heart animation */}
        <Animated.View
          style={[
            heartStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={80} color="#f87171" />
        </Animated.View>

        {/* Progress bar */}
        <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/15">
          <View
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
          <View
            className="absolute w-1.5 h-1.5 rounded-full bg-white"
            style={{
              left: progressKnobLeft,
              top: -1.5,
              marginLeft: -3,
            }}
          />
        </View>
      </View>
    </GestureDetector>
  );
}
