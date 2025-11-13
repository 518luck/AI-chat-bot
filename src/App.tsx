import { ArrowUp } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import "./global.css";
import { useState } from "react";

function App() {
  const [isExpanded, setIsExpanded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
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
    <main className="flex h-screen flex-col items-center justify-center">
      {/* 标题 */}
      <section>
        <h1 className="relative mx-auto p-4 text-3xl font-medium">
          你在忙什么?
        </h1>
      </section>
      {/* 聊天消息 */}
      {/* <section className="sticky top-0 left-0">
        <div>您好</div>
        <div>很高兴见到你</div>
      </section> */}
      {/* 测试  ProseMirror */}
      {/* 底部输入框 */}
      <section className="bg-background flex w-full max-w-171 rounded-[28px] border p-2 shadow-sm">
        <div
          className={`justify-between" flex max-h-56 min-h-[38px] w-full items-center ${isExpanded ? "flex-col" : ""}`}
        >
          <EditorContent
            editor={editor}
            className="max-h-66.5 w-full flex-99 overflow-x-hidden p-2"
          />
          <div className="flex w-full flex-1 justify-end">
            <div className="cursor-pointer rounded-full bg-black p-1.5">
              <ArrowUp color="#fff" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
