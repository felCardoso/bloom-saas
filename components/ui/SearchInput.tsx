import { Search } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  wrapperClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ wrapperClassName, className, ...props }, ref) => (
    <div className={cn("relative", wrapperClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      <input
        ref={ref}
        type="text"
        className={cn(
          "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent shadow-card",
          className,
        )}
        {...props}
      />
    </div>
  ),
);

SearchInput.displayName = "SearchInput";
