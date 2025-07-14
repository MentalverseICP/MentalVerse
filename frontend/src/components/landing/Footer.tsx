import { Brain } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-xl border-t border-green-500/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-white text-xl font-bold">MentalVerse</span>
            </div>
            <p className="text-gray-400">
              Revolutionizing mental health care through blockchain technology and compassionate support.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Individual Therapy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Group Therapy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Crisis Support</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Mindfulness</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Articles</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Meditations</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Workshops</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-green-500/30 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MentalVerse. All rights reserved. Built on Internet Computer Protocol.</p>
        </div>
      </div>
    </footer>
  );
};