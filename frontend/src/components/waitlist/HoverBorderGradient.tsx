import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ValidTags = "button" | "div" | "span";

type TagMap = {
  button: HTMLButtonElement;
  div: HTMLDivElement;
  span: HTMLSpanElement;
};

type HoverBorderGradientProps<T extends ValidTags> = React.HTMLAttributes<
  TagMap[T]
> & {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  as?: T;
  duration?: number;
  clockwise?: boolean;
};

export const HoverBorderGradient = <T extends ValidTags = "button">({
  children,
  containerClassName,
  className,
  as,
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps<T>) => {
  const Tag = as ?? "button";
  const [hovered, setHovered] = useState(false);
  type Direction = keyof typeof movingMap;
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0.05) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0.05) 100%)",
    BOTTOM:
      "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0.05) 100%)",
    RIGHT:
      "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0.05) 100%)",
  };

  const highlight =
    "radial-gradient(32% 50% at 24.325% 25.675%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.1) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration, clockwise]);

  return React.createElement(
    Tag,
    {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      className: `relative flex rounded-full border-[1.5px] border-white/10 content-center bg-black/20 hover:bg-black/10 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit ${containerClassName}`,
      ...props,
    },
    <>
      <div
        className={`w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit] ${className}`}
      >
        {children}
      </div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(2px) brightness(1.5)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-black absolute z-1 flex-none inset-[500rem] rounded-[500px]" />
    </>
  );
};
