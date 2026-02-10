import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <View className={`items-center ${compact ? 'py-8' : 'py-16'} px-8`}>
      <View
        className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-full bg-accent-subtle items-center justify-center mb-4`}
      >
        <Ionicons
          name={icon}
          size={compact ? 28 : 36}
          color="#7c3aed"
        />
      </View>
      <Text className="text-h3 text-text-primary text-center mb-1">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-body text-text-secondary text-center">
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <View className="mt-4">
          <Button label={actionLabel} onPress={onAction} size="sm" />
        </View>
      )}
    </View>
  );
}
