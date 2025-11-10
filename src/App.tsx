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
      <section className="bg-background w-full max-w-160 rounded-[28px] border px-2 py-2 shadow-sm">
        <div className="relative">
          <div className="pt-2">
            <textarea
              autoFocus
              className="w-full bg-amber-300 pr-12 pl-3 outline-none"
              placeholder="询问任何问题"
            />
          </div>
          <div className="p absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer rounded-full bg-black p-1.5">
            <ArrowUp color="#fff" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
