import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "font-head transition-all outline-hidden cursor-pointer duration-200 font-medium flex items-center disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "shadow-md hover:shadow-none bg-primary text-black border-2 border-black transition hover:translate-y-1 hover:bg-primary-hover disabled:hover:bg-primary disabled:hover:translate-y-0",
        secondary:
          "shadow-md hover:shadow-none bg-secondary shadow-primary text-secondary-foreground border-2 border-black transition hover:translate-y-1 disabled:hover:bg-secondary disabled:hover:translate-y-0",
        outline:
          "shadow-md hover:shadow-none bg-transparent border-2 transition hover:translate-y-1 disabled:hover:bg-transparent disabled:hover:translate-y-0",
        link: "bg-transparent hover:underline disabled:hover:no-underline",
        destructive:
          "shadow-md hover:shadow-none bg-destructive text-destructive-foreground border-2 border-destructive transition hover:translate-y-1 disabled:hover:bg-destructive disabled:hover:translate-y-0",
      },
      size: {
        sm: "px-3 py-1 text-sm shadow hover:shadow-none disabled:shadow-none",
        md: "px-4 py-1.5 text-base",
        lg: "px-8 py-3 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      size = "md",
      className = "",
      variant = "default",
      ...props
    }: IButtonProps,
    forwardedRef
  ) => (
    <button
      ref={forwardedRef}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
