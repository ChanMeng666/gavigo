// Web storage adapter using localStorage
export const appStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage full or unavailable
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
