import { ChevronDown, Settings2, Sun, MoonStar } from "lucide-react";
import cs from "classnames";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import useThemeStore from "@/stores/theme.stores";

const Header = () => {
  const { theme, setTheme } = useThemeStore((state) => state);

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

          <DialogContent className="[&>button.absolute]:hidden">
            <DialogHeader>
              <DialogTitle>设置</DialogTitle>
            </DialogHeader>

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
