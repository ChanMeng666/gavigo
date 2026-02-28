// Native storage adapter using react-native-mmkv
// Install: npx expo install react-native-mmkv
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

export const appStorage = {
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkv.set(key, value),
  removeItem: (key: string): void => mmkv.delete(key),
};
