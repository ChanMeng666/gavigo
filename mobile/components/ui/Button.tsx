import { ActivityIndicator, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-bg-surface border border-border',
  ghost: 'bg-transparent',
  danger: 'bg-error/10',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-text-primary',
  ghost: 'text-text-primary',
  danger: 'text-error',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-11 px-4',
  lg: 'h-[52px] px-6',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: 'text-caption',
  md: 'text-body',
  lg: 'text-body',
};

const sizeIconSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      className={`flex-row items-center justify-center gap-2 rounded-btn ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''}`}
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'danger' ? '#f87171' : 'white'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeIconSizes[size]}
              color={variant === 'danger' ? '#f87171' : variant === 'secondary' ? '#f0f0f5' : 'white'}
            />
          )}
          <Text
            className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]}`}
          >
            {label}
          </Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeIconSizes[size]}
              color={variant === 'danger' ? '#f87171' : variant === 'secondary' ? '#f0f0f5' : 'white'}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
