import { useEffect, useState } from "react";
import { ChevronDown, Sun, MoonStar } from "lucide-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { PasteFilter } from "@/utils/PasteFilter";
import cs from "classnames";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useMount } from "ahooks";

import "./global.css";
import EditInput from "@/components/EditInput";
import type { ChatMessage } from "@/types/chatMessage-type";
import Messages from "@/components/Messages";

function App() {
  // 输入框是否展开
  const [isExpanded, setIsExpanded] = useState(false);
  // 当前主题
  const [theme, setTheme] = useState("light");
  // 回复内容
  const [reply, setReply] = useState<ChatMessage[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useMount(async () => {
    const response = await fetch("http://localhost:3000/history");
    const historyMessages = await response.json().catch(() => []);
    setReply(historyMessages);
    // 滚动到底部
  });

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
  const handleSubmit = (text: string) => {
    fetchEventSource("http://localhost:3000/sse", {
      method: "POST",
      body: JSON.stringify({
        query: text,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      signal: ctrl.signal,
      onopen: async (res) => {
        console.log("连接成功:", res);
      },
      onmessage(ev) {
        console.log("收到数据:", ev.data);
        const data = JSON.parse(ev.data);
        const content = data.payload?.content || "";
        setReply((prev) => prev + content);
      },
      onclose() {
        console.log("连接关闭");
      },
      onerror(err) {
        console.error("出错了:", err);
        throw err;
      },
    });
  };

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
