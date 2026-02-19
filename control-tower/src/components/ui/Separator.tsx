import { Separator } from "@radix-ui/react-separator"
import { cn } from "@/utils/cn"

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function SeparatorComponent({ className, orientation = "horizontal" }: SeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
    />
  )
}

export { SeparatorComponent as Separator }