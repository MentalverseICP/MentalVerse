import { Brain, Menu, X } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomConnectButton, CustomConnectedButton } from "./CustomConnectButton";
import { scrollToSection } from "./MotionComponent";
import { ConnectWallet, ConnectWalletDropdownMenu } from "@nfid/identitykit/react";
import MentalIcon from "@/images/mental_mobile.svg";



export const Header: React.FC<{ onWalletDisconnect?: () => void }> = ({ onWalletDisconnect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  type User = {
  account?: string;
};

  const useAuth = (): { user: User | null } => ({ user: null });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleDisconnect = () => {
    if (onWalletDisconnect) {
      onWalletDisconnect();
      navigate('/');
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/95 backdrop-blur-lg border-b border-green-500/30' : ''}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center animate-pulse"> */}
              {/* <Brain className="text-white" size={16} /> */}
              <img src={MentalIcon} alt="" />
            {/* </div> */}
            <span className="text-white text-xl font-bold">MentalVerse</span>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            {[
              { label: 'About', id: 'about' },
              { label: 'Services', id: 'services' },
              // { label: 'Therapists', id: 'therapists' },
              { label: 'Technology', id: 'technology' },
              { label: 'Testimonials', id: 'testimonials' },
              { label: 'Contact', id: 'contact' }
            ].map((item) => (
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
            <ConnectWallet
              connectButtonComponent={CustomConnectButton}
              connectedButtonComponent={(props: {connectedAccount?: string; onClick?:(e:MouseEvent<HTMLButtonElement>) => void }) => (
                <CustomConnectedButton {...props} />
              )}
              dropdownMenuComponent={ConnectWalletDropdownMenu}
            />
          </div>
          
          <button 
            type='button'
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 bg-black/95 backdrop-blur-lg rounded-lg shadow-lg transition-all duration-300 ease-in-out transform">
            <nav className="flex flex-col space-y-4 p-4">
              {[
                { label: 'About', id: 'about' },
                { label: 'Services', id: 'services' },
                // { label: 'Therapists', id: 'therapists' },
                { label: 'Technology', id: 'technology' },
                { label: 'Testimonials', id: 'testimonials' },
                { label: 'Contact', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  className="text-gray-300 hover:text-green-500 text-left transition-colors"
                  onClick={() => { scrollToSection(item.id); setIsMenuOpen(false); }}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-700 flex justify-center">
                <ConnectWallet
                  connectButtonComponent={CustomConnectButton}
                  connectedButtonComponent={(props: {connectedAccount?: string; onClick?:(e:MouseEvent<HTMLButtonElement>) => void }) => (
                    <CustomConnectedButton {...props} />
                  )}
                  dropdownMenuComponent={ConnectWalletDropdownMenu}
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
