'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils'; // if you have a classNames helper, otherwise use tailwind directly
import React from 'react';

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  className?: string;
  viewportClassName?: string;
}

export const ScrollArea = ({
  className,
  children,
  viewportClassName,
  ...props
}: ScrollAreaProps) => (
  <ScrollAreaPrimitive.Root className={cn('overflow-hidden', className)} {...props}>
    <ScrollAreaPrimitive.Viewport className={cn('w-full h-full', viewportClassName)}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex touch-none select-none p-0.5 bg-transparent hover:bg-gray-200 transition-colors"
    >
      <ScrollAreaPrimitive.Thumb className="bg-gray-400 rounded-full flex-1" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar
      orientation="horizontal"
      className="flex touch-none select-none p-0.5 bg-transparent hover:bg-gray-200 transition-colors"
    >
      <ScrollAreaPrimitive.Thumb className="bg-gray-400 rounded-full flex-1" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);
