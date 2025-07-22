// components/layout/Container.tsx

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full xl:max-w-screen-xl mx-auto px-4 md:px-6 ", // consistent layout
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
