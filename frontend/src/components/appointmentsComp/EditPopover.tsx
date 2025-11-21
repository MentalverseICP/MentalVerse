import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Clock } from "lucide-react";
import { Edit } from "lucide-react";
import moment from "moment";

interface EditPopoverProps {
  event: Event;
  onClose: () => void;
  style?: React.CSSProperties;
  onEdit: (event: Event) => void;
}

const eventColors: { [key: string]: string } = {
  emergency: "bg-[#074A2D]",
  examination: "bg-[#FECA57]",
  routine: "bg-[#F80D38]",
  consultation: "bg-[#18E614]",
  sick: "bg-[#18E614]",
};

type EventType =
  | "emergency"
  | "examination"
  | "routine"
  | "consultation"
  | "sick";

interface Event {
  doctor?: string;
  start: Date;
  end: Date;
  type: EventType;
  title: string;
  startTime?: string;
  endTime?: string;
}

const EditPopover = ({
  event,
  onClose,
  style = {},
  onEdit,
}: EditPopoverProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl shadow-2xl rounded-2xl p-5 w-96 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30 overflow-hidden"
      style={{ ...style }}
    >
      {/* Subtle gradient overlays for depth */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#18E614]/5 dark:bg-[#18E614]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4 justify-between border-b border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 pb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 bg-gradient-to-br from-[#DFE0E2]/50 to-[#DFE0E2]/30 dark:from-[#3D3D3D]/50 dark:to-[#3D3D3D]/30 rounded-full backdrop-blur-sm border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 flex items-center justify-center"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#18E614]/20 to-transparent" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white">
                {event.doctor || "No Doctor Assigned"}
              </h3>
              <p className="text-[10px] text-[#18E614] font-medium tracking-wider uppercase">
                Doctor
              </p>
            </div>
          </div>

          <div className="ml-auto flex justify-between gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Edit appointment"
              type="button"
              onClick={() => onEdit(event)}
              className="p-2.5 rounded-xl border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm hover:bg-black hover:border-white/50 transition-all hover:text-white text-black dark:hover:text-black dark:text-white dark:hover:bg-[#DFE0E2] hover:shadow-lg"
            >
              <Edit size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Delete appointment"
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm hover:bg-black hover:border-white/50 transition-all hover:text-white text-black dark:hover:text-black dark:text-white dark:hover:bg-[#DFE0E2] hover:shadow-lg"
            >
              <ShoppingBag size={16} />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/30 dark:bg-[#1f1f1f]/30 backdrop-blur-sm border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/50 dark:bg-[#3D3D3D]/30">
              <Clock size={14} className="text-black dark:text-white" />
            </div>
            <p className="text-xs font-medium text-black dark:text-white">
              {moment(event.start).format("h:mm A")}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-[#1f1f1f]/50 border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/40">
            <span
              className={`rounded-full w-2 h-2 ${
                eventColors[event.type]
              } shadow-lg`}
            ></span>
            <p className="text-[10px] uppercase font-bold tracking-wider text-black dark:text-white">
              {event.type}
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center"
          >
            <span className="text-xs dark:text-white text-black px-3 py-1.5 rounded-full uppercase font-bold bg-gradient-to-r from-white/50 to-white/30 dark:from-[#1f1f1f]/50 dark:to-[#1f1f1f]/30 backdrop-blur-sm border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30">
              {event.title.length > 11
                ? event.title.slice(0, 11) + "..."
                : event.title}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditPopover;
