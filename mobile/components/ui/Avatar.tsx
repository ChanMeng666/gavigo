import { View, Text, Image } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
};

const textSizeMap: Record<AvatarSize, string> = {
  sm: 'text-caption',
  md: 'text-body',
  lg: 'text-h1',
  xl: 'text-display',
};

const FALLBACK_COLORS = [
  '#7c3aed', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export function Avatar({ uri, name = '?', size = 'md' }: AvatarProps) {
  const dimension = sizeMap[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={`${name}'s avatar`}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        }}
      />
    );
  }

  const bgColor = getColorFromName(name);
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <View
      accessibilityLabel={`${name}'s avatar`}
      className="items-center justify-center"
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        backgroundColor: bgColor,
      }}
    >
      <Text className={`text-white font-bold ${textSizeMap[size]}`}>
        {initial}
      </Text>
    </View>
  );
}
