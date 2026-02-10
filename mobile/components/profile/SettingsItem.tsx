import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

export function SettingsItem({ icon, label, value, onPress }: SettingsItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 border-b border-border-subtle"
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ minHeight: 56 }}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-bg-elevated items-center justify-center">
          <Ionicons name={icon} size={20} color="#8e8ea0" />
        </View>
        <Text className="text-body text-text-primary">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        {value && (
          <Text className="text-caption text-text-tertiary">{value}</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color="#555568" />
      </View>
    </TouchableOpacity>
  );
}
