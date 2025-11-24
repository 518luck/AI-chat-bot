import { useRef, useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { PasteFilter } from "@/utils/PasteFilter";
import cs from "classnames";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useMount, useKeyPress } from "ahooks";
import { toast } from "sonner";

import "./global.css";
import EditInput from "@/components/EditInput";
import type { ChatMessage } from "@/types/chatMessage-type";
import Messages from "@/components/Messages";
import useThemeStore, { type Theme } from "@/stores/theme.stores";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { BASE_URL } from "@/config";
import { useToastConfigStore } from "@/stores/toast.config.stores";

function App() {
  const toastConfig = useToastConfigStore((state) => state.config);
  const setToastConfig = useToastConfigStore((state) => state.setToastConfig);
  // 输入框是否展开
  const [isExpanded, setIsExpanded] = useState(false);
  // 当前主题
  // const [theme, setTheme] = useState("light");
  // 回复内容
  const [reply, setReply] = useState<ChatMessage[]>([]);

  // 从zustand中获取主题
  const { theme, setTheme } = useThemeStore((state) => state);

  // 消息容器
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  //监听本地存储,判断是否有主题,没有就用系统主题偏好
  useEffect(() => {
    const saved = localStorage.getItem("theme"); // 读取本地存储
    if (saved) {
      const localStorageTheme = JSON.parse(saved).state.theme;
      if (localStorageTheme === "light" || localStorageTheme === "dark") {
        setTheme(localStorageTheme as Theme); // 写入 store
      }
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(systemDark ? "dark" : "light"); // 使用系统主题
    }
  }, [setTheme]);

  // 监听主题变化,改变主题
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useMount(async () => {
    const response = await fetch(BASE_URL + "history", { credentials: "omit" });
    const historyMessages = await response.json().catch(() => []);
    setReply(historyMessages);
  });

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [reply]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      PasteFilter,
      Placeholder.configure({
        placeholder: "询问任何问题",
      }),
    ],

    onUpdate: ({ editor }) => {
      // 如果输入框一旦换行,就一直展开,为空的时候再缩起来
      const contentHeight = editor.view.dom.scrollHeight;
      if (contentHeight > 20) {
        setIsExpanded(true);
      }
      const isEmpty = editor.isEmpty;
      if (isEmpty) {
        setIsExpanded(false);
      }
    },
  });

  const ctrl = new AbortController();
  const handleSubmit = () => {
    //输入框的文本内容
    const text = editor.getText().trim();
    if (!text) return; // 避免空字符串
    // 清空输入框
    editor.commands.setContent("");
    //用户发送的信息
    if (!editor) return;
    setReply((prev) => {
      return [...prev, { type: "user", payload: { content: text } }];
    });

    // sse返回的数据
    fetchEventSource(BASE_URL + "sse", {
      method: "POST",
      body: JSON.stringify({
        query: text,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit",
      signal: ctrl.signal,

      onmessage(ev) {
        if (ev.event === "close" || !ev.data) return;
        let data;
        try {
          data = JSON.parse(ev.data);
        } catch {
          return;
        }

        const content = data?.payload?.content ?? "";
        const isPartial = !!data?.partial;
        const type = data?.type ?? "assistant";

        // 错误信息
        if (type === "error") {
          toast.error(content);
          setToastConfig({ position: "top-center", richColors: true });
          return;
        }

        setReply((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.type === "assistant" && isPartial) {
            const merged = {
              ...last,
              payload: { content: (last.payload?.content ?? "") + content },
              partial: isPartial,
            };
            return [...prev.slice(0, -1), merged];
          }
          return [...prev, { type, payload: { content }, partial: isPartial }];
        });
      },

      onerror(err) {
        throw err;
      },
    });
  };

  // 键盘监听
  useKeyPress("Enter", handleSubmit, { target: editor.view.dom });

  return (
    <div className="flex h-screen flex-col dark:bg-[#212121]">
      <Toaster {...toastConfig} className="pointer-events-auto" />
      {/* 顶部状态栏 */}
      <section
        className={cs("sticky top-0", {
          "outline outline-[#f2f2f2] dark:outline-[#2c2c2c]": !reply.length,
        })}
      >
        <Header onDeleted={() => setReply([])} />
      </section>

      <main
        ref={messagesContainerRef}
        className={cs(
          "scrollbar-thin dark:scrollbar-track-[#212121] dark:scrollbar-thumb-[#383838] scrollbar-track-[#ffffff] scrollbar-thumb-[#cccccc] flex w-full justify-center py-2",
          {
            "mt-40": !reply.length,
            "h-[calc(100vh-64px-96px)] overflow-y-auto": reply.length,
          },
        )}
      >
        <section className="w-full max-w-[750px]">
          {/* 标题 */}
          {!reply.length && (
            <section>
              <h1 className="mx-auto p-4 text-3xl font-medium">你在忙什么?</h1>
            </section>
          )}

          {/* 聊天消息 */}
          <Messages reply={reply} />
        </section>
      </main>

      {/* 底部输入框 */}
      <footer
        className={cs("flex w-full justify-center", {
          "sticky bottom-8 z-10": !isExpanded,
        })}
      >
        <EditInput
          isExpanded={isExpanded}
          editor={editor}
          handleSubmit={handleSubmit}
        />
      </footer>
    </div>
  );
}

export default App;
