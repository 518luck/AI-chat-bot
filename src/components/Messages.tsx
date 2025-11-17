import cs from "classnames";
import type { ChatMessage } from "@/types/chatMessage-type";

const Message = ({ reply }: { reply: ChatMessage[] }) => {
  return (
    <section>
      {reply.length !== 0 && (
        <section>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((item) => (
            <div
              className={cs("flex", {
                "justify-end": item % 2 !== 0,
              })}
            >
              <div
                className={cs(
                  "mb-9 inline-flex min-h-9 w-fit flex-col rounded-2xl p-4",
                  { "max-w-[448px] bg-[#303030]": item % 2 !== 0 },
                )}
              >
                {/* {reply.trim()} */}
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  );
};

export default Message;
