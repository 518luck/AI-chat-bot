import cs from "classnames";
import type { ChatMessage } from "@/types/chatMessage-type";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import useThemeStore from "@/stores/theme.stores";
import { useEffect } from "react";

const Message = ({ reply }: { reply: ChatMessage[] }) => {
  const { theme } = useThemeStore((s) => s);

  useEffect(() => {
    const load = async () => {
      if (theme === "dark") {
        await import("highlight.js/styles/github-dark.css");
      } else {
        await import("highlight.js/styles/github.css");
      }
    };
    load();
  }, [theme]);

  return (
    <section>
      {reply.length !== 0 && (
        <section>
          {reply.map((item, index) => (
            <div
              key={index}
              className={cs("flex w-[750px]", {
                "justify-end": item.type === "user",
              })}
            >
              <div
                className={cs(
                  "prose prose-sm dark:prose-invert s crollbar-thin mb-9 inline-flex min-h-9 w-fit flex-col overflow-x-auto rounded-2xl p-4 wrap-break-word",
                  {
                    "max-w-[448px] bg-[#f4f4f4] dark:bg-[#303030]":
                      item.type === "user",
                  },
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {item?.payload?.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  );
};

export default Message;
