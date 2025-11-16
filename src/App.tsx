import { useEffect, useState } from "react";
import { ArrowUp, ChevronDown, Sun, MoonStar } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { PasteFilter } from "@/utils/PasteFilter";
import cs from "classnames";

import "./global.css";

function App() {
  // 输入框是否展开
  const [isExpanded, setIsExpanded] = useState(false);
  // 输入框是否为空
  const [isMessageEmpty, setIsMessageEmpty] = useState(true);
  // 当前主题
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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

  return (
    <div className="flex min-h-screen flex-col dark:bg-[#303030]">
      {/* 顶部状态栏 */}
      <section>
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

      <main className="mt-30 flex flex-1 flex-col items-center justify-start">
        {/* 标题 */}
        <section>
          <h1 className="relative mx-auto p-4 text-3xl font-medium">
            你在忙什么?
          </h1>
        </section>
        {/* 聊天消息 */}
        <section className="sticky top-0 left-0">
          <div>您好</div>
          <div>很高兴见到你</div>
        </section>
        {/* 测试  ProseMirror */}
        {/* 底部输入框 */}
        <section className="flex w-full max-w-171 rounded-[28px] border p-2 shadow-sm dark:bg-[#303030]">
          <div
            className={`justify-between" flex max-h-56 min-h-[38px] w-full items-center ${isExpanded ? "flex-col" : ""}`}
          >
            <EditorContent
              editor={editor}
              className="max-h-66.5 w-full flex-99 overflow-x-hidden p-2"
            />
            <div
              className="flex w-full flex-1 justify-end"
              onClick={() => setIsMessageEmpty(!isMessageEmpty)}
            >
              <div className="cursor-pointer rounded-full bg-black p-1.5 dark:bg-white">
                <ArrowUp className="text-white dark:text-black" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
