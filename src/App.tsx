import { useRef, useEffect, useState } from "react";
import { ChevronDown, Sun, MoonStar } from "lucide-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { PasteFilter } from "@/utils/PasteFilter";
import cs from "classnames";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useMount, useKeyPress } from "ahooks";

import "./global.css";
import EditInput from "@/components/EditInput";
import type { ChatMessage } from "@/types/chatMessage-type";
import Messages from "@/components/Messages";
import useThemeStore, { type Theme } from "@/stores/theme.stores";

function App() {
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useMount(async () => {
    const response = await fetch("http://localhost:3000/history");
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
    fetchEventSource("http://localhost:3000/sse", {
      method: "POST",
      body: JSON.stringify({
        query: text,
      }),
      headers: {
        "Content-Type": "application/json",
      },
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
    <div className="flex flex-col dark:bg-[#212121]">
      {/* 顶部状态栏 */}
      <section
        className={cs("sticky top-0", {
          "outline outline-[#f2f2f2] dark:outline-[#2c2c2c]": !reply.length,
        })}
      >
        <div className="flex items-center justify-between p-2">
          {/* 模型切换 */}
          <section>
            <div className="flex cursor-pointer items-center rounded-md p-1 text-lg select-none hover:bg-gray-200 dark:hover:bg-[#303030]">
              ChatGPT
              <ChevronDown />
            </div>
          </section>

          {/* 主题切换 */}
          <section>
            <div className="border-border relative flex w-24 items-center justify-between rounded-full border-2 border-solid p-1 px-3">
              <div
                className={cs(
                  "absolute h-6 w-8 rounded-full transition-transform duration-300 ease-in-out",
                  {
                    "-translate-x-1 bg-gray-200": theme === "light",
                    "translate-x-10 bg-[#181818]": theme === "dark",
                  },
                )}
              />
              <Sun
                size={20}
                className="cursor-pointer"
                onClick={() => setTheme("light")}
              />
              <MoonStar
                size={20}
                className="cursor-pointer"
                onClick={() => setTheme("dark")}
              />
            </div>
          </section>
        </div>
      </section>

      <main
        ref={messagesContainerRef}
        className={cs("flex w-full justify-center py-2", {
          "mt-40": !reply.length,
          "h-[calc(100vh-64px-96px)] overflow-y-auto": reply.length,
        })}
      >
        <section className="max-w-[750px]">
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
        className={cs("bottom-8 z-10 flex w-full justify-center", {
          sticky: !isExpanded,
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
