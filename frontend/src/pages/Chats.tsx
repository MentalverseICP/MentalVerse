import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Search, Send, Paperclip, Menu, X, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";

const chatList = [
	{
		id: 1,
		name: "Dr. Ibrahim Yekeni",
		title: "Family Doctor",
		lastMessage: "3 min ago",
		unread: 0,
		active: true,
		avatar: "IY",
	},
	{
		id: 2,
		name: "Dr. Ebuka Kelechi",
		title: "Heart Surgeon",
		lastMessage: "10 min ago",
		unread: 1,
		active: false,
		avatar: "EK",
	},
	{
		id: 3,
		name: "Dr. Sarah Johnson",
		title: "Pediatrician",
		lastMessage: "2 hours ago",
		unread: 3,
		active: false,
		avatar: "SJ",
	},
	{
		id: 4,
		name: "Dr. Michael Chen",
		title: "Dermatologist",
		lastMessage: "1 day ago",
		unread: 0,
		active: false,
		avatar: "MC",
	},
];

const messages = [
	{
		id: 1,
		sender: "doc",
		text: "Hi Mrs Boluwatife, Please send the images as discussed on your last visit",
		time: "1 week ago",
		avatar: "IY",
	},
	{
		id: 2,
		sender: "me",
		text: "Hi Doc. Here are the images. Sorry for coming late though",
		time: "28 min ago",
		avatar: "BT",
		attachments: [
			{ type: "image", name: "scan1.jpg" },
			{ type: "image", name: "scan2.jpg" },
			{ type: "image", name: "scan3.jpg" },
		],
	},
	{
		id: 3,
		sender: "doc",
		text: "THANKS! I'll review them and then get back to you ASAP!",
		time: "25 min ago",
		avatar: "IY",
	},
	{
		id: 4,
		sender: "doc",
		text: "",
		time: "20 min ago",
		avatar: "IY",
		file: {
			name: "Transcend.zip",
			size: "1.2MB",
			type: "zip",
		},
	},
];

const Chats: React.FC = () => {
	const [search, setSearch] = useState("");
	const [input, setInput] = useState("");
	const [selectedChat, setSelectedChat] = useState(chatList[0].id);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	// Check screen size on mount and resize
	useEffect(() => {
		const checkScreenSize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (mobile) {
				setSidebarOpen(false);
			} else {
				setSidebarOpen(true);
			}
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	const selectedChatData = chatList.find(chat => chat.id === selectedChat);

	const handleSendMessage = () => {
		if (input.trim()) {
			// Add message logic here
			setInput("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleChatSelect = (chatId: number) => {
		setSelectedChat(chatId);
		if (isMobile) {
			setSidebarOpen(false);
		}
	};

	return (
		<div className="h-screen w-full flex overflow-hidden relative sm:p-4 md:p-8 p-5 max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]">
			{/* Mobile Overlay */}
			{isMobile && sidebarOpen && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={cn(
					"flex-shrink-0 transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700",
					isMobile 
						? sidebarOpen 
							? "absolute inset-0 w-fit z-50 ml-2" 
							: "w-0 overflow-hidden"
						: sidebarOpen 
							? "w-80" 
							: "w-0 overflow-hidden"
				)}
			>
				<div className={cn("h-full flex flex-col", sidebarOpen ? "opacity-100" : "opacity-0")}>
					{/* Sidebar Header */}
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center justify-between mb-4">
							<h1 className="text-xl font-bold text-gray-900 dark:text-white">
								Messages
							</h1>
							<button 
								title="Close sidebar"
								type="button"
								onClick={() => setSidebarOpen(false)}
								className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								<X className="w-5 h-5 text-gray-500" />
							</button>
						</div>
						
						{/* Search */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
								placeholder="Search conversations..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>

					{/* Chat List */}
					<div className="flex-1 overflow-y-auto">
						{chatList
							.filter(
								(chat) =>
									chat.name.toLowerCase().includes(search.toLowerCase()) ||
									chat.title.toLowerCase().includes(search.toLowerCase())
							)
							.map((chat) => (
								<div
									key={chat.id}
									className={cn(
										"flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700",
										selectedChat === chat.id
											? "bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-emerald-500"
											: ""
									)}
									onClick={() => handleChatSelect(chat.id)}
								>
									<div className="relative">
										<div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#18E614a1] to-emerald-700 hover:from-[#18E614a1] hover:to-emerald-800 flex items-center justify-center text-white font-semibold">
											{chat.avatar}
										</div>
										{chat.active && (
											<div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold text-gray-900 dark:text-white truncate">
												{chat.name}
											</h3>
											<span className="text-xs text-gray-500 ml-2">
												{chat.lastMessage}
											</span>
										</div>
										<div className="flex items-center justify-between mt-1">
											<p className="text-sm text-gray-500 truncate">
												{chat.title}
											</p>
											{chat.unread > 0 && (
												<span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
													{chat.unread}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className={cn(
				"flex-1 flex flex-col",
				isMobile && sidebarOpen ? "hidden" : "flex"
			)}>
				{/* Chat Header */}
				<div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button 
								title="Open sidebar"
								type="button"
								onClick={() => setSidebarOpen(true)}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
							>
								{isMobile ? <ArrowLeft className="w-5 h-5 text-gray-500" /> : <Menu className="w-5 h-5 text-gray-500" />}
							</button>
							{!isMobile && !sidebarOpen && (
								<button 
									title="Open sidebar"
									type="button"
									onClick={() => setSidebarOpen(true)}
									className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								>
									<Menu className="w-5 h-5 text-gray-500" />
								</button>
							)}
							<div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#18E614a1] to-emerald-700 hover:from-[#18E614a1] hover:to-emerald-800 flex items-center justify-center text-white font-semibold">
								{selectedChatData?.avatar}
							</div>
							<div>
								<h2 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
									{selectedChatData?.name}
								</h2>
								<p className="text-xs md:text-sm text-gray-500">
									{selectedChatData?.active ? "Active now" : "Active 50min ago"}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-1 md:gap-2">
							<button title="Call" type="button" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
							</button>
							<button title="Video call" type="button" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<Video className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
							</button>
							<button title="More options" type="button" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
							</button>
						</div>
					</div>
				</div>

				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 overscroll-auto scrollbar-custom">
					{/* Date Separator */}
					<div className="flex items-center justify-center">
						<div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
							<span className="text-xs text-gray-500">1 WEEK AGO</span>
						</div>
					</div>

					{/* Doctor Message */}
					<div className="flex items-start gap-2 md:gap-3">
						<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#18E614a1] to-emerald-700 hover:from-[#18E614a1] hover:to-emerald-800 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
							IY
						</div>
						<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-3 md:px-4 py-2 md:py-3 max-w-[75%] md:max-w-md">
							<p className="text-sm md:text-base text-gray-900 dark:text-white">
								Hi Mrs Boluwatife,<br />
								Please send the images as discussed on your last visit
							</p>
						</div>
					</div>

					{/* Today Separator */}
					<div className="flex items-center justify-center">
						<div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
							<span className="text-xs text-gray-500">TODAY</span>
						</div>
					</div>

					{/* My Message */}
					<div className="flex items-start gap-2 md:gap-3 justify-end">
						<div className="bg-gradient-to-r from-[#18E614a1] to-emerald-700 hover:from-[#18E614a1] hover:to-emerald-800 text-white rounded-2xl rounded-tr-md px-3 md:px-4 py-2 md:py-3 max-w-[75%] md:max-w-md">
							<p className="text-sm md:text-base">Hi Doc. Here are the images. Sorry for coming late though</p>
						</div>
						<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs md:text-sm font-semibold">
							BT
						</div>
					</div>

					{/* Attachments */}
					<div className="flex items-center gap-1 md:gap-2 justify-end pr-8 md:pr-11">
						<div className="flex items-center gap-1 md:gap-2">
							<div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
								<span className="text-xs">IMG</span>
							</div>
							<div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
								<span className="text-xs">IMG</span>
							</div>
							<div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
								<span className="text-xs">IMG</span>
							</div>
							<div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
								<span className="text-xs text-emerald-700 dark:text-emerald-300">+5</span>
							</div>
						</div>
					</div>

					{/* Doctor Reply */}
					<div className="flex items-start gap-2 md:gap-3">
						<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#18E614a1] to-emerald-700 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
							IY
						</div>
						<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-3 md:px-4 py-2 md:py-3 max-w-[75%] md:max-w-md">
							<p className="text-sm md:text-base text-gray-900 dark:text-white">
								THANKS! I'll review them and then get back to you ASAP!
							</p>
						</div>
					</div>

					{/* File Message */}
					<div className="flex items-start gap-2 md:gap-3">
						<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#18E614a1] to-emerald-700 hover:from-[#18E614a1] hover:to-emerald-800 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
							IY
						</div>
						<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-3 md:px-4 py-2 md:py-3 max-w-[75%] md:max-w-md">
							<div className="flex items-center gap-2 md:gap-3">
								<div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500 flex items-center justify-center">
									<span className="text-xs text-white font-semibold">ZIP</span>
								</div>
								<div className="flex-1">
									<p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
										Transcend.zip
									</p>
									<p className="text-xs text-gray-500">1.2MB</p>
								</div>
								<button title="Download" type="button" className="p-1 md:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
									<Paperclip className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Message Input */}
				<div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700">
					<div className="flex items-end gap-2 md:gap-3">
						<button title="Attach file" type="button" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
							<Paperclip className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
						</button>
						<div className="flex-1">
							<Input
								className="rounded-lg border-gray-300 dark:border-gray-600 text-sm md:text-base"
								placeholder="Type a message..."
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
							/>
						</div>
						<Button
							onClick={handleSendMessage}
							className="bg-gradient-to-r from-[#18E614a1] to-emerald-700 hover:from-[#18E614a1] hover:to-emerald-800 text-white rounded-lg px-3 md:px-4 py-2"
						>
							<Send className="w-4 h-4 md:w-5 md:h-5" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Chats;