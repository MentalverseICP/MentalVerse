import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  X,
  Facebook,
  Instagram,
  Upload,
  Users,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  XIcon
} from "lucide-react";
import mentalIconDark from "@/images/mental_Icon_mobile_dark1.svg";
import {  } from "lucide-react";

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

function HoverBorderGradient<T extends ValidTags = "button">({
  children,
  containerClassName,
  className,
  as,
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps<T>) {
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
    "radial-gradient(75% 181.16% at 50% 50%, #3275F8 0%, rgba(50, 117, 248, 0.4) 100%)";

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
      className: `relative flex rounded-full border content-center bg-black/20 hover:bg-black/10 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit ${containerClassName}`,
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
}

type CardType = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  className: string;
};

const LayoutGrid = ({ cards }: { cards: CardType[] }) => {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={card.className}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#03050b51] backdrop-filter backdrop-blur-[14px] border border-[#ffffff14] rounded-xl h-full w-full shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden"
            layoutId={`card-${card.id}`}
          >
            <div className="p-6 h-full flex flex-col relative">
              <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-transparent border border-emerald-800/30 rounded-br-xl rounded-tl-3xl blur-sm" />
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 z-10">
                {card.title}
              </h3>
              <p className="text-gray-400 text-sm z-10">{card.description}</p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

const FlipText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className="block"
        animate={{
          rotateX: isHovered ? [0, 90, 0] : 0,
        }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.span>
    </div>
  );
};

export default function Waitlist() {
  const [email, setEmail] = useState("");

  const features = [
    {
      id: 1,
      title: "Real-Time Updates",
      description:
        "Keep customers informed about their position in the waitlist.",
      icon: <Upload className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 2,
      title: "Priority Management",
      description:
        "Assign priority levels to customers based on predefined criteria.",
      icon: <Users className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 3,
      title: "Integration Capabilities",
      description:
        "Seamlessly integrate the waitlist functionality into your website.",
      icon: <CheckCircle className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 4,
      title: "Analytics & Insights",
      description: "Gain valuable insights into customer behavior & demand.",
      icon: <BarChart3 className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
  ];

  const partners = [
    { name: "Dfinity", logo: "" },
    { name: "ICPHub", logo: "" },
    { name: "ICPHub Nigeria", logo: "" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* background effects */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Primary gradient layer */}
        {/* <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        /> */}

        {/* Secondary animated gradients */}
        {/* <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(600px circle at left top, rgba(255, 255, 255, 0.03), transparent 80%)",
              "radial-gradient(600px circle at right top, rgba(255, 255, 255, 0.03), transparent 80%)",
              "radial-gradient(600px circle at left bottom, rgba(255, 255, 255, 0.03), transparent 80%)",
              "radial-gradient(600px circle at right bottom, rgba(255, 255, 255, 0.03), transparent 80%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        /> */}

        {/* Noise texture overlay */}
        {/* <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            transform: "scale(1.5)",
          }}
        /> */}

        {/* Moving spotlight effect */}
        {/* <motion.div
          className="absolute -inset-[100%] opacity-[0.02]"
          animate={{
            transform: [
              "translate(0%, 0%) rotate(0deg)",
              "translate(50%, 25%) rotate(180deg)",
              "translate(-25%, 35%) rotate(360deg)",
              "translate(0%, 0%) rotate(0deg)",
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.5), transparent)",
          }}
        /> */}
      </div>

      {/* Hero/Waitlist Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className="text-[20vw] font-bold select-none tracking-wider text-center"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(104, 104, 104, 0.471)",
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0.091) 0%, rgba(255, 255, 255, 0) 100%)",
              WebkitBackgroundClip: "text",
              textShadow: "0 0 100px rgba(255, 255, 255, 0.023)",
            }}
          >
            Coming soon!
          </motion.h1>
        </div>

        <div className="max-w-2xl mx-auto w-full relative z-10">
          {/* Background Text */}
          <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
            <div className="text-[20vw] font-black text-white/[0.02] whitespace-nowrap overflow-hidden select-none">
              MENTALVERSE
            </div>
          </div>{" "}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />

            {/* Main Waitlist Card */}
            <div className="relative bg-[#03050b51] backdrop-filter backdrop-blur-[14px] border border-[#ffffff14] hover:bg-[#03050 rounded-[32px] p-8 py-10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:rounded-[32px]">
              {/* Heading with Flip Effect */}
              <div className="flex justify-center items-center">
                <FlipText className="text-4xl font-bold mb-4 text-center inline-block">
                  <span className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                    Join our waitlist!
                  </span>
                </FlipText>
              </div>

              <p className="text-gray-400 mb-6 text-sm leading-relaxed text-center">
                Sign up for our newsletter to receive the latest updates and
                insights straight to your inbox.
              </p>

              {/* Email Input Section */}
              <div className="flex gap-3 mb-8">
                <HoverBorderGradient
                  containerClassName="flex-1"
                  className="w-full"
                  as="div"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none py-1"
                  />
                </HoverBorderGradient>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Join Waitlist
                </motion.button>
              </div>

              {/* Component Library Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="p-6 bg-[#03050b51] backdrop-filter backdrop-blur-[14px] border border-[#ffffff14] rounded-2xl relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#03050b51] backdrop-filter backdrop-blur-[14px] border border-[#ffffff14] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-xl">⚡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        Choose a component
                      </p>
                      <h4 className="text-white font-semibold text-lg mb-2">
                        Components library
                      </h4>
                      <p className="text-sm text-gray-400">
                        Our template offers a range of customization options.
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs px-3 py-1 bg-zinc-800/50 rounded-full text-gray-300">
                    ✓ Header Section
                  </span>
                  <span className="text-xs px-3 py-1 bg-zinc-800/50 rounded-full text-gray-300">
                    Streamlined Quickstart
                  </span>
                  <span className="text-xs px-3 py-1 bg-zinc-800/50 rounded-full text-gray-300">
                    Features
                  </span>
                </div>
              </motion.div>

              {/* Social Links */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/[0.04] transition-colors relative overflow-hidden"
                >
                  <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                  <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                  <XIcon className="w-5 h-5 relative z-10" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="inline-block bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 text-sm mb-6">
              Our Partners
            </span>
            <FlipText className="text-4xl font-bold mb-4">
              Trusted by Brands
            </FlipText>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We collaborate with industry-leading partners to bring you the
              best in class services.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-[#03050b51] backdrop-filter backdrop-blur-[14px] border border-[#ffffff14] hover:bg-[#03050b70] shadow-[0_0_30px_rgba(255,255,255,0.05)] rounded-2xl px-6 py-4 flex items-center gap-3transition-all relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />

                <span className="text-2xl relative z-10">{partner.logo}</span>
                <span className="font-medium text-white relative z-10">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6 min-h-screen flex items-center">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden bottom-0 pb-20">
          <motion.h1
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[20vw] font-bold leading-none select-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.15)",
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0.091) 0%, rgba(255, 255, 255, 0) 100%)",
              WebkitBackgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(255,255,255,0.1))",
              borderImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent) 1",
            }}
          >
            {/* Join waitlist */}
            Features
          </motion.h1>
        </div>

        <div className="w-full max-w-5xl mx-auto">
          <LayoutGrid cards={features} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all inline-flex items-center gap-2"
            >
              Join Waitlist
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden bottom-0 pb-20">
          <motion.h1
            initial={{ opacity: 0, y: 170 }}
            whileInView={{ opacity: 1, y: 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[23vw] w-fit font-bold leading-none select-none tracking-tighter"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.15)",
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0.091) 0%, rgba(255, 255, 255, 0) 100%)",
              WebkitBackgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(255,255,255,0.1))",
              borderImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent) 1",
            }}
          >
            Contact
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto w-full"
        >
          {/* Contact Card */}
          <div className="relative bg-[#03050b51] backdrop-filter backdrop-blur-[14px] border border-[#ffffff14] hover:bg-[#03050b70] shadow-[0_0_30px_rgba(255,255,255,0.05)]  rounded-[32px] p-12 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:rounded-[32px]">
            {/* Logo */}
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 mx-auto overflow-hidden">
              <img
                src={mentalIconDark}
                alt="MentalVerse Logo"
                className="w-16 h-16 object-contain"
              />
            </div>

            <p className="text-center text-gray-400 mb-10 text-base leading-relaxed">
              We'd love to hear from you if you have questions, need support, or
              want to learn more.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center gap-3 mb-10">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/[0.04] transition-colors relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <XIcon className="w-5 h-5 relative z-10" />
              </motion.button>
              {/* <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-12 h-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/[0.04] transition-colors relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <Facebook className="w-5 h-5 relative z-10" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/[0.04] transition-colors relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <Instagram className="w-5 h-5 relative z-10" />
              </motion.button> */}
            </div>

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <Mail className="w-6 h-6 mb-3 text-gray-400 relative z-10" />
                <p className="font-semibold text-white mb-1 relative z-10">
                  Email us
                </p>
                <p className="text-sm text-gray-400 relative z-10">
                  hi@affanlab.com
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <Phone className="w-6 h-6 mb-3 text-gray-400 relative z-10" />
                <p className="font-semibold text-white mb-1 relative z-10">
                  Call us
                </p>
                <p className="text-sm text-gray-400 relative z-10">
                  (501) 123-4567
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <MapPin className="w-6 h-6 mb-3 text-gray-400 relative z-10" />
                <p className="font-semibold text-white mb-1 relative z-10">
                  Location
                </p>
                <p className="text-sm text-gray-400 relative z-10">
                  Crosby Street, NY, USA
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-20">
          <footer className="relative z-10 pb-8 px-6 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-600 text-sm mb-4">
                ©2025 Mentalverse Waitlist 
              </p>
              {/* <div className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                <span>🚀</span>
                Made in Framer
              </div> */}
            </motion.div>
          </footer>
        </div>
      </section>
    </div>
  );
}
