import "./global.css";
import { ArrowUp } from "lucide-react";

function App() {
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
      {/* 底部输入框 */}
      <section className="bg-background flex w-full max-w-160 rounded-[28px] border px-2 shadow-sm">
        <div className="relative flex max-h-66.5 min-h-[56px] w-full items-center">
          <div
            contentEditable
            suppressContentEditableWarning
            className="max-h-66.5 w-full overflow-x-hidden overflow-y-auto px-4 py-2 pr-12 wrap-break-word whitespace-pre-wrap outline-none"
            data-placeholder="询问任何问题"
          />
          <div className="absolute right-2 bottom-2 cursor-pointer rounded-full bg-black p-1.5">
            <ArrowUp color="#fff" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
