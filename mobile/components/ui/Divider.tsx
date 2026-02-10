import { View } from 'react-native';

interface DividerProps {
  subtle?: boolean;
  spacing?: string;
}

export function Divider({ subtle = false, spacing = '' }: DividerProps) {
  return (
    <View
      className={`h-px ${subtle ? 'bg-border-subtle' : 'bg-border'} ${spacing}`}
    />
  );
}
