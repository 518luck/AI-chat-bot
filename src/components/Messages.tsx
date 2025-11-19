import cs from "classnames";
import type { ChatMessage } from "@/types/chatMessage-type";

const Message = ({ reply }: { reply: ChatMessage[] }) => {
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
                  "mb-9 inline-flex min-h-9 w-fit flex-col rounded-2xl p-4",
                  {
                    "max-w-[448px] bg-[#f4f4f4] dark:bg-[#303030]":
                      item.type === "user",
                  },
                )}
              >
                {item.payload.content}
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  );
};

export default Message;
