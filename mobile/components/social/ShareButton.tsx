import { useState } from 'react';
import { View, Text, Share, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IconButton } from '@/components/ui';

interface ShareButtonProps {
  contentId: string;
  title: string;
}

export function ShareButton({ contentId, title }: ShareButtonProps) {
  const scale = useSharedValue(1);
  const [copied, setCopied] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleShare = async () => {
    scale.value = withSpring(0.9, { damping: 6 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 6 });
    }, 100);

    if (Platform.OS === 'web') {
      // Build a proper HTTPS URL for web sharing
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const shareUrl = `${origin}/mobile/video/${contentId}`;
      const shareText = `Check out "${title}" on GAVIGO IRE! ${shareUrl}`;

      // Try Web Share API first
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title, text: shareText, url: shareUrl });
          return;
        } catch {
          // User cancelled or API not supported — fall through to clipboard
        }
      }

      // Fallback: copy to clipboard
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          // HTTP fallback: use legacy execCommand('copy')
          const textarea = document.createElement('textarea');
          textarea.value = shareUrl;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard failed
      }
      return;
    }

    // Native share
    try {
      await Share.share({
        message:
          Platform.OS === 'ios'
            ? title
            : `Check out "${title}" on GAVIGO IRE!`,
        url: `gavigo://content/${contentId}`,
        title: title,
      });
    } catch {
      // User cancelled or error
    }
  };

  return (
    <View className="items-center gap-1">
      <Animated.View style={animatedStyle}>
        <IconButton
          icon="share-social-outline"
          variant="filled"
          onPress={handleShare}
          accessibilityLabel="Share"
        />
      </Animated.View>
      <Text className="text-micro text-text-primary">
        {copied ? 'Copied!' : 'Share'}
      </Text>
    </View>
  );
}
