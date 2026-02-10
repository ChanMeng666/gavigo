import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconButtonVariant = 'filled' | 'ghost' | 'accent' | 'danger';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  color?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  filled: 'bg-white/10',
  ghost: 'bg-transparent',
  accent: 'bg-accent',
  danger: 'bg-error/10',
};

const variantIconColors: Record<IconButtonVariant, string> = {
  filled: 'white',
  ghost: '#8e8ea0',
  accent: 'white',
  danger: '#f87171',
};

export function IconButton({
  icon,
  onPress,
  variant = 'filled',
  size = 24,
  color,
  disabled = false,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      className={`w-11 h-11 rounded-full items-center justify-center ${variantStyles[variant]}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Ionicons
        name={icon}
        size={size}
        color={color || variantIconColors[variant]}
      />
    </TouchableOpacity>
  );
}
