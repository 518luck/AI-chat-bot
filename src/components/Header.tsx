import { ChevronDown, Sun, MoonStar } from "lucide-react";
import cs from "classnames";
import useThemeStore from "@/stores/theme.stores";

const Header = () => {
  const { theme, setTheme } = useThemeStore((state) => state);

  return (
    <header>
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
        </section>
      </div>
    </header>
  );
};

export default Header;
