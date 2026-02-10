import { useRef, useState, useEffect, useCallback } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { getApiBase } from '@/services/api';

const videoFileMap: Record<string, string> = {
  'video-football-1': '/videos/football-1.mp4',
  'video-football-2': '/videos/football-2.mp4',
  'video-football-3': '/videos/football-3.mp4',
  'video-scifi-1': '/videos/scifi-1.mp4',
  'video-scifi-2': '/videos/scifi-2.mp4',
};

interface VideoPlayerProps {
  contentId: string;
  isVisible: boolean;
}

export function VideoPlayer({ contentId, isVisible }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const pauseIndicatorOpacity = useSharedValue(0);

  const videoPath = videoFileMap[contentId] || '/videos/football-1.mp4';
  const videoUri = `${getApiBase()}${videoPath}`;

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

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (!next) {
        pauseIndicatorOpacity.value = withTiming(1, { duration: 200 });
      } else {
        pauseIndicatorOpacity.value = withDelay(
          200,
          withTiming(0, { duration: 300 })
        );
      }
      return next;
    });
  };

  const pauseStyle = useAnimatedStyle(() => ({
    opacity: pauseIndicatorOpacity.value,
  }));

  return (
    <TouchableWithoutFeedback onPress={togglePlay}>
      <View className="absolute inset-0 bg-black">
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={false}
          shouldPlay={isVisible && isPlaying}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Pause indicator */}
        <Animated.View
          style={[pauseStyle]}
          className="absolute inset-0 items-center justify-center"
        >
          <View className="h-16 w-16 rounded-full bg-black/30 items-center justify-center">
            <Ionicons name="play" size={32} color="white" />
          </View>
        </Animated.View>

        {/* Progress bar */}
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <View
            className="h-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
