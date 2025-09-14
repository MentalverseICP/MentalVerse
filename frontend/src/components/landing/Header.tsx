import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { scrollToSection } from "./MotionComponent";
import { useAuth } from "../../contexts/AuthContext";
import MentalIcon from "@/images/mental_mobile.svg";

interface HeaderProps {
  onWalletDisconnect?: () => void;
}

// Simple connect button component
const SimpleConnectButton = () => {
  const { isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ onWalletDisconnect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const ids = [
    { label: "About", id: "about" },
    { label: "Technology", id: "technology" },
    { label: "Testimonials", id: "testimonials" },
    { label: "Contact", id: "contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-lg border-b border-green-500/30"
          : ""
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={MentalIcon} alt="MentalVerse Logo" />
            <span className="text-white text-xl font-bold">MentalVerse</span>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {ids.map((item) => (
              <button
                key={item.id}
                className="text-gray-300 hover:text-green-400 transition-colors duration-300 relative group"
                onClick={() => scrollToSection(item.id)}
                type="button"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <SimpleConnectButton />
          </div>

          <button
            type="button"
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 bg-black/95 backdrop-blur-lg rounded-lg shadow-lg transition-all duration-300 ease-in-out transform">
            <nav className="flex flex-col space-y-4 p-4">
              {ids.map((item) => (
                <button
                  key={item.id}
                  className="text-gray-300 hover:text-green-500 text-left transition-colors"
                  onClick={() => {
                    scrollToSection(item.id);
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-700 flex justify-center">
                <SimpleConnectButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
