import { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'search' | 'chat';
}

export function TextInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? 'border-error'
    : isFocused
      ? 'border-accent'
      : 'border-border';

  const containerStyles =
    variant === 'search'
      ? `flex-row items-center bg-bg-elevated rounded-pill px-4 h-12 ${borderColor} border`
      : variant === 'chat'
        ? `flex-row items-center bg-bg-surface rounded-pill px-4 h-11`
        : `flex-row items-center bg-bg-surface rounded-xl px-4 h-12 ${borderColor} border`;

  return (
    <View>
      {label && (
        <Text className="text-caption text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <View className={containerStyles}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={isFocused ? '#7c3aed' : '#555568'}
            style={{ marginRight: 8 }}
          />
        )}
        <RNTextInput
          placeholderTextColor="#555568"
          accessibilityLabel={label || props.placeholder}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 text-body text-text-primary"
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel="Toggle visibility"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color="#555568"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-caption text-error mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
