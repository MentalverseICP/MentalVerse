import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Upload,
  Users,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  LucideX,
} from "lucide-react";
import mentalIconDark from "@/images/mental_Icon_mobile_dark1.svg";
import icpHub from "@/images/Icp_hub.jpg";
import icpHubNigeria from "@/images/icphub_nigeria.png";
import { HoverBorderGradient } from "./HoverBorderGradient";
import { LayoutGrid } from "./LayoutGrid";
import { FlipText } from "./FlipText";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const features = [
    {
      id: 1,
      title: "Early Mental Support",
      description:
        "Get priority access to AI-powered mental health support and counseling services.",
      icon: <Upload className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 2,
      title: "Wellness Community",
      description:
        "Join a supportive community of individuals on their mental health journey.",
      icon: <Users className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 3,
      title: "Anonymous Support",
      description:
        "Access confidential mental health resources with complete privacy and security.",
      icon: <CheckCircle className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 4,
      title: "Wellness Tracking",
      description:
        "Monitor your mental health progress with personalized analytics.",
      icon: <BarChart3 className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 5,
      title: "Priority Access",
      description:
        "Be first in line to experience innovative mental wellness features.",
      icon: <ArrowUpRight className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
    {
      id: 6,
      title: "24/7 Support",
      description:
        "Get round-the-clock access to mental health resources and assistance.",
      icon: <CheckCircle className="w-5 h-5 text-white/60" />,
      className: "col-span-1",
    },
  ];

  const handleWaitlistSubmission = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Simulate API call

      setMessage({
        type: "success",
        text: "Thanks for joining! We'll keep you updated on our progress.",
      });
      setEmail(""); // Clear the input
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const partners = [
    {
      name: "Dfinity",
      logo: (
        <img
          src="https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png?1696514180"
          alt="Dfinity"
          className="w-8 h-8 object-contain rounded-full"
        />
      ),
    },
    {
      name: "ICPHub",
      logo: (
        <img
          src={icpHub}
          alt="ICP Hub"
          className="w-8 h-8 object-contain rounded-full"
        />
      ),
    },
    {
      name: "ICPHub Nigeria",
      logo: (
        <img
          src={icpHubNigeria}
          alt="ICP Hub Nigeria"
          className="w-8 h-8 object-contain rounded-full"
        />
      ),
    },
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
      <section
        id="waitlist-hero"
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
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
                <FlipText className="text-5xl font-bold mb-4 text-center inline-block">
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
                  duration={2}
                  clockwise={true}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none py-2 px-4"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(32%_50%_at_24.325%_25.675%,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] opacity-[0.03] blur-[10px] rounded-full pointer-events-none" />
                </HoverBorderGradient>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !email}
                  onClick={handleWaitlistSubmission}
                  className={`px-6 py-3 bg-white font-semibold rounded-full transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-gray-100 cursor-pointer"
                    }
                    ${
                      !email
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-black">Joining...</span>
                    </>
                  ) : (
                    <span className="text-black">Join Waitlist</span>
                  )}
                </motion.button>
                {message.text && (
                  <div
                    className={`mt-2 text-sm ${
                      message.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
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
                        Mental Wellness Pioneer
                      </p>
                      <h4 className="text-white font-semibold text-lg mb-2">
                        Early Access Benefits
                      </h4>
                      <p className="text-sm text-gray-400">
                        Be among the first to experience AI-powered mental
                        health support, personalized wellness journeys, and a
                        supportive community.
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs px-3 py-1 bg-zinc-800/50 rounded-full text-gray-300">
                    ✓ Personalized Support
                  </span>
                  <span className="text-xs px-3 py-1 bg-zinc-800/50 rounded-full text-gray-300">
                    Anonymous Community
                  </span>
                  <span className="text-xs px-3 py-1 bg-zinc-800/50 rounded-full text-gray-300">
                    24/7 Mental Care
                  </span>
                </div>
              </motion.div>

              {/* Social Links */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <motion.a
                  href="https://x.com/mentalverse_ICP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl px-1 py-1 hover:bg-white/[0.04] transition-colors relative overflow-hidden w-[14rem]"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                  <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                  <div className="flex items-center gap-2 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/[0.04] transition-colors relative overflow-hidden"
                    >
                      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                      <LucideX className="w-7 h-7 relative z-10" />
                    </motion.button>
                    <span className="text-sm font-medium">
                      @mentalverse_ICP
                    </span>
                  </div>
                </motion.a>
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
            <div className="flex justify-center items-start gap-5">
              <span className="inline-block bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 text-sm mb-6">
                Our Partners
              </span>
              <FlipText className="text-4xl font-bold mb-4">
                Trusted by Brands
              </FlipText>
            </div>

            <p className="text-gray-400 max-w-2xl mx-auto">
              We partner with leading mental health organizations and technology
              innovators to provide secure, accessible, and effective mental
              wellness support.
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
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-700/30 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />

                <div className="flex items-center gap-3 relative z-10 flex-wrap">
                  <span className="text-2xl relative z-10">{partner.logo}</span>
                  <span className="font-medium text-white relative z-10">
                    {partner.name}
                  </span>
                </div>
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
            initial={{ opacity: 0, y: 130 }}
            whileInView={{ opacity: 1, y: 70 }}
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
              onClick={() => {
                document.getElementById("waitlist-hero")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="bg-white text-black font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all inline-flex items-center gap-2 cursor-pointer"
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
              <motion.a
                href="https://x.com/mentalverse_ICP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl px-1 py-1 hover:bg-white/[0.04] transition-colors relative overflow-hidden w-[14rem]"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                <div className="flex items-center gap-2 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/[0.04] transition-colors relative overflow-hidden"
                  >
                    <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/20 border border-emerald-800/30 rounded-br-2xl rounded-tl-3xl blur-2xl" />
                    <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-emerald-900/10 rounded-br-2xl rounded-tl-3xl filter blur-3xl" />
                    <LucideX className="w-7 h-7 relative z-10" />
                  </motion.button>
                  <span className="text-sm font-medium">@mentalverse_ICP</span>
                </div>
              </motion.a>
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
                <p className="sm:text-xs text-sm text-gray-400 relative z-10">
                  mentalverseinc@gmail.com
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
                  +2347016401210
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
                  Internet Computer
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
