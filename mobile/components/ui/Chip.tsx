import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}

export function Chip({
  label,
  selected = false,
  onPress,
  leftIcon,
  compact = false,
}: ChipProps) {
  const bg = selected ? 'bg-accent' : 'bg-bg-surface border border-border';
  const textColor = selected ? 'text-white' : 'text-text-secondary';
  const padding = compact ? 'px-2 py-0.5' : 'py-2.5 px-3';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-1.5 rounded-pill ${bg} ${padding}`}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={compact ? 12 : 16}
          color={selected ? 'white' : '#8e8ea0'}
        />
      )}
      <Text
        className={`${compact ? 'text-micro' : 'text-caption'} font-medium ${textColor}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
