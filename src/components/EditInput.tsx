import cs from "classnames";
import { type Editor, EditorContent } from "@tiptap/react";
import { ArrowUp } from "lucide-react";

interface EditInputProps {
  isExpanded: boolean; //是否展开
  editor: Editor; //编辑器实例
  isMessageEmpty: boolean; //输入框是否为空
  setIsMessageEmpty: (isMessageEmpty: boolean) => void; //设置输入框是否为空
}
const EditInput = ({
  isExpanded,
  editor,
  isMessageEmpty,
  setIsMessageEmpty,
}: EditInputProps) => {
  return (
    <section className="flex w-full max-w-3xl rounded-[28px] border p-2 shadow-sm dark:bg-[#303030]">
      <div
        className={cs(
          "flex max-h-56 min-h-[38px] w-full items-center justify-between",
          {
            "flex-col": isExpanded,
          },
        )}
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
  );
};

export default EditInput;
