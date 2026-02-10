import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="mt-6">
      <Text className="text-micro uppercase tracking-wider text-text-tertiary ml-1 mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
}
