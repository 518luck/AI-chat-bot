import { ChevronDown, Settings2, Sun, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";
import cs from "classnames";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import useThemeStore from "@/stores/theme.stores";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BASE_URL } from "@/config";
import { useState } from "react";

type HeaderProps = {
  onDeleted: () => void;
};
const Header = ({ onDeleted }: HeaderProps) => {
  const { theme, setTheme } = useThemeStore((state) => state);
  const [apiKey, setApiKey] = useState("");

  //提交apiKey
  const handleSubmitApiKey = async () => {
    return await fetch(BASE_URL + "api-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey }),
    });
  };

  //删除所有对话
  const handleDeleteMessage = async () => {
    return await fetch(BASE_URL + "delete-message", {
      method: "POST",
    });
  };

  return (
    <header>
      <div className="flex items-center justify-between p-2">
        {/* 模型切换 */}
        <div className="flex cursor-pointer items-center rounded-md p-1 text-lg select-none hover:bg-gray-200 dark:hover:bg-[#303030]">
          ChatGPT
          <ChevronDown />
        </div>

        {/* 主题切换 */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="cursor-pointer rounded-md p-1 text-lg select-none hover:bg-gray-200 dark:hover:bg-[#303030]">
              <Settings2 />
            </button>
          </DialogTrigger>

          <DialogContent
            showCloseButton={false}
            className="bg-[#ffffff] dark:bg-[#212121]"
          >
            <DialogHeader>
              <DialogTitle>设置</DialogTitle>
              <DialogDescription>
                这里可以调整主题或者清空对话历史
              </DialogDescription>
            </DialogHeader>
            {/* 切换主题 */}
            <div className="py-2">
              <p>切换主题</p>
              <div className="border-border relative mt-2 flex w-24 items-center justify-between rounded-full border-2 border-solid p-1 px-3">
                <div
                  className={cs(
                    "absolute h-6 w-8 rounded-full transition-transform duration-300 ease-in-out",
                    {
                      "-translate-x-1 bg-gray-200": theme === "light",
                      "translate-x-10 bg-[#303030]": theme === "dark",
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
            </div>

            {/* 清空对话 */}
            <div className="py-2">
              <Button
                variant="destructive"
                className="flex items-center"
                onClick={() => {
                  toast.promise<{ success: boolean; data: string }>(
                    () =>
                      handleDeleteMessage().then((res) => {
                        return res.json();
                      }),
                    {
                      loading: "Loading...",
                      success: (data) => {
                        onDeleted();
                        return data.data;
                      },
                      error: "Error",
                    },
                  );
                }}
              >
                清空对话
              </Button>
            </div>

            {/* 录入key */}
            <div className="py-2">
              <p className="mb-2">Qwen API Key</p>
              <div>
                <Input
                  onChange={(e) => setApiKey(e.target.value)}
                  type="text"
                  placeholder="请输入Qwen API Key"
                  className="w-[300px]"
                  onBlur={() => {
                    toast.promise<{ success: boolean; data: string }>(
                      () =>
                        handleSubmitApiKey().then((res) => {
                          return res.json();
                        }),
                      {
                        loading: "Loading...",
                        success: (data) => {
                          onDeleted();
                          return data.data;
                        },
                        error: "Error",
                      },
                    );
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose>
                <div className="cursor-pointer rounded-md p-1 text-lg select-none hover:bg-gray-200 dark:hover:bg-[#303030]">
                  关闭
                </div>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
