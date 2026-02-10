import { View, TouchableOpacity, Text, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareButtonProps {
  contentId: string;
  title: string;
}

export function ShareButton({ contentId, title }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      await Share.share({
        message:
          Platform.OS === 'ios'
            ? title
            : `Check out "${title}" on GAVIGO IRE! gavigo://content/${contentId}`,
        url: `gavigo://content/${contentId}`,
        title: title,
      });
    } catch {
      // User cancelled or error
    }
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      className="items-center gap-1"
      activeOpacity={0.7}
    >
      <View className="w-11 h-11 rounded-full bg-white/10 items-center justify-center">
        <Ionicons name="share-social-outline" size={24} color="white" />
      </View>
      <Text className="text-white text-xs font-medium">Share</Text>
    </TouchableOpacity>
  );
}
