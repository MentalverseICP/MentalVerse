import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Search, Send } from "lucide-react";

const chatList = [
  {
    id: 1,
    name: "Dr. Ibrahim Yekeni",
    title: "Family Doctor",
    lastMessage: "3 min ago",
    unread: 0,
    active: true,
  },
  {
    id: 2,
    name: "Dr. Ebuka Kelechi",
    title: "Heart Surgeon",
    lastMessage: "10 min ago",
    unread: 1,
    active: false,
  },
  // ...add more chats
];

const messages = [
  {
    id: 1,
    sender: "doc",
    text: "Hi Mrs Boluwatife, Please send the images as discussed on your last visit",
    time: "1 week ago",
    avatar: "",
  },
  {
    id: 2,
    sender: "me",
    text: "Hi Doc. Here are the images. Sorry for coming late though",
    time: "28 min ago",
    avatar: "",
    attachments: [
      // Example avatars
      "/img1.jpg", "/img2.jpg", "/img3.jpg"
    ]
  },
  {
    id: 3,
    sender: "doc",
    text: "THANKS! I'll review them and then get back to you ASAP!",
    time: "today",
    avatar: "",
  },
  {
    id: 4,
    sender: "doc",
    text: "",
    time: "28 min ago",
    avatar: "",
    file: {
      name: "Transcend.zip",
      size: "1.2MB",
      type: "zip"
    }
  }
];

const Chats: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full p-2 md:p-6 gap-2">
      {/* Sidebar */}
      <div className="w-full max-w-xs flex flex-col bg-black dark:bg-white/5 rounded-2xl border border-gray-700 dark:border-gray-200 p-2">
        <span className="font-bold text-lg text-red-500 mb-2">Chats</span>
        <div className="flex-1 overflow-y-auto">
          {chatList.map(chat => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1",
                chat.active ? "bg-[#181A2A]" : "",
                "hover:bg-[#23263a]"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="font-semibold text-white dark:text-white">{chat.name}</div>
                <div className="text-xs text-red-500">{chat.title}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">{chat.lastMessage}</span>
                {chat.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 mt-1">{chat.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Input
            className="w-full rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
            placeholder="Search doctor or medical department"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-black dark:bg-white/5 rounded-2xl border border-gray-700 dark:border-gray-200 p-2 md:p-6">
        {/* Chat header */}
        <div className="flex items-center border-b border-gray-700 dark:border-gray-200 pb-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mr-3" />
          <div>
            <div className="font-semibold text-white dark:text-white">Dr. Ibrahim Yekeni</div>
            <div className="text-xs text-gray-400">Active 50min ago</div>
          </div>
          <div className="ml-auto text-white dark:text-white text-2xl cursor-pointer">...</div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-8">
          {/* Example: group by date */}
          <div className="text-center text-xs text-gray-400 mb-2">1 WEEK AGO</div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="bg-[#181A2A] text-white rounded-2xl px-6 py-3 max-w-lg">
              Hi Mrs Boluwatife, <br />
              Please send the images as discussed on your last visit
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 mb-2">TODAY</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-end gap-3">
              <div className="bg-[#181A2A] text-white rounded-2xl px-6 py-3 max-w-lg ml-auto">
                Hi Doc. Here are the images. Sorry for coming late though
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
            <div className="flex items-center gap-2 justify-end">
              {/* Example avatars */}
              <img src="/img1.jpg" alt="" className="w-8 h-8 rounded-full object-cover" />
              <img src="/img2.jpg" alt="" className="w-8 h-8 rounded-full object-cover" />
              <img src="/img3.jpg" alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="bg-[#181A2A] text-white text-xs rounded-full px-2 py-0.5">+5</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="bg-[#181A2A] text-white rounded-2xl px-6 py-3 max-w-lg">
                THANKS! I'll review them and then get back to you ASAP!
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center bg-[#181A2A] text-white rounded-2xl px-6 py-3 max-w-lg">
                <div className="flex items-center gap-2">
                  <div className="bg-green-600 rounded-lg px-2 py-1 flex items-center gap-2">
                    <span className="font-bold">ZIP</span>
                    <span>Transcend.zip</span>
                    <span className="text-xs">1.2MB</span>
                  </div>
                  <Button size="icon" className="ml-2 bg-transparent text-white hover:bg-gray-700">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 5v14m7-7H5" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Input */}
        <div className="flex items-center border-t border-gray-700 dark:border-gray-200 pt-4 mt-4">
          <Input
            className="flex-1 rounded-full bg-black dark:bg-white/5 border border-gray-700 dark:border-gray-200 text-white dark:text-white"
            placeholder="Start typing here"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button size="icon" className="ml-2 bg-red-500 text-white rounded-full">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chats;