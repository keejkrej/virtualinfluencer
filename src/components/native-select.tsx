import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-input bg-background h-8 w-full border px-2 text-xs outline-none",
        className,
      )}
      {...props}
    />
  );
}
