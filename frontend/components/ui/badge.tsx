import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        active:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100/80 dark:hover:bg-green-900/40",
        inactive:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        offline:
          "border-transparent bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 hover:bg-fuchsia-100/80 dark:hover:bg-fuchsia-900/40",
        expired:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100/80 dark:hover:bg-red-900/40",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "active",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
