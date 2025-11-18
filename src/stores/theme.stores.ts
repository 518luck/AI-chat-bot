import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";
interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: "theme",
    },
  ),
);

export default useThemeStore;
