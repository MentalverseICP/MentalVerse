import { motion } from "framer-motion";

type CardType = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  className: string;
};

export const LayoutGrid = ({ cards }: { cards: CardType[] }) => {
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