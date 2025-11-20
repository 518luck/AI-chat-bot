import { create } from "zustand";

type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";
export interface ToastConfigData {
  position: ToastPosition;
  richColors: boolean;
}
// Store 类型：包含状态与动作
interface ToastConfigStore {
  config: ToastConfigData;
  // 传入完整或部分配置，返回值为 void
  setToastConfig: (config: Partial<ToastConfigData>) => void;
}
export const useToastConfigStore = create<ToastConfigStore>((set) => ({
  config: {
    position: "bottom-right",
    richColors: true,
  },
  setToastConfig: (config: Partial<ToastConfigData>) =>
    set((state) => ({ config: { ...state.config, ...config } })),
}));
