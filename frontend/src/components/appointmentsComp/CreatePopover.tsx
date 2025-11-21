import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { X, ChevronDown, Plus, Trash2, Clock, User, Tag } from "lucide-react";
import { Edit } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import doctorsData from "../../data/DoctorsData";

const eventColors: { [key: string]: string } = {
  emergency: "bg-[#074A2D]",
  examination: "bg-[#FECA57]",
  routine: "bg-[#F80D38]",
  consultation: "bg-[#18E614]",
  sick: "bg-[#18E614]",
};

type EventType = "emergency" | "examination" | "routine" | "consultation" | "sick";

interface Event {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  startTime?: string;
  endTime?: string;
  doctor?: string;
}

type WeekDayPopoverProps = {
  closePopover: () => void;
  popoverPosition: { top: number; left: number };
  eventTitle: string;
  setEventTitle: (title: string) => void;
  eventType: EventType;
  setEventType: (type: EventType) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  addOrUpdateEvent: () => void;
  selectedEvent: Event | null;
  deleteEvent: () => void;
  selectedDoctor: string;
  setSelectedDoctor: (doctor: string) => void;
};

const CreatePopover = ({
  closePopover,
  popoverPosition,
  eventTitle,
  setEventTitle,
  eventType,
  setEventType,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  addOrUpdateEvent,
  selectedEvent,
  deleteEvent,
  selectedDoctor,
  setSelectedDoctor,
}: WeekDayPopoverProps) => {
  const doctors = doctorsData.map((doctor) => doctor.name);

  // Get the actual dates from selectedEvent or use current date
  const startDate = selectedEvent ? new Date(selectedEvent.start) : new Date();
  const endDate = selectedEvent ? new Date(selectedEvent.end) : new Date();

  // Parse time strings to create Date objects for DatePicker
  const getTimeDate = (timeStr: string, baseDate: Date) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return (
    <Popover.Content
      className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl text-black dark:text-white shadow-2xl rounded-2xl w-[95vw] max-w-[420px] max-h-[90vh] md:max-h-[600px] absolute z-50 border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30"
      style={{ top: popoverPosition.top, left: popoverPosition.left }}
      asChild
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Ambient background effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#18E614]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with Action Buttons */}
          <div className="border-b border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 px-4 md:px-5 py-3 flex justify-between items-center bg-white/50 dark:bg-[#0B0B0C]/50">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="bg-gradient-to-r from-[#18E614]/90 to-[#18E614]/80 text-white px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-[#18E614]/30 transition-all duration-300 flex items-center gap-1.5 md:gap-2"
                onClick={addOrUpdateEvent}
              >
                {selectedEvent ? <Edit size={12} className="md:w-[14px] md:h-[14px]" /> : <Plus size={12} className="md:w-[14px] md:h-[14px]" />}
                <span>{selectedEvent ? "Update" : "Create"}</span>
              </motion.button>
              
              {selectedEvent && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#F80D38]/30 text-[#F80D38] px-2.5 md:px-3 py-2 rounded-lg transition-all duration-300 hover:bg-[#F80D38] hover:text-white hover:shadow-lg hover:shadow-[#F80D38]/20 flex items-center gap-1.5 md:gap-2"
                  onClick={deleteEvent}
                  title="Delete"
                >
                  <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 text-black dark:text-white p-2 rounded-lg hover:border-[#18E614] transition-all"
              onClick={closePopover}
              title="Close"
            >
              <X size={14} className="md:w-4 md:h-4" />
            </motion.button>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto scrollbar-custom flex-1 px-4 md:px-5 py-3 md:py-4">
            <div className="space-y-1">
              {/* Title Input */}
              <div className="flex items-start gap-2 md:gap-3 py-2">
                <div className="mt-2">
                  <Tag size={16} className="md:w-[18px] md:h-[18px] text-[#2f3339] dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full bg-transparent border-0 border-b hover:border-[#DFE0E2]/50 dark:hover:border-[#3D3D3D]/50 border-[#18E614] p-0 pb-2 focus:outline-none text-base md:text-lg font-normal text-black dark:text-white placeholder:text-gray-400 transition-all"
                    placeholder="Add a title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Time Section */}
              <div className="flex items-start gap-2 md:gap-3 py-3 border-b border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30">
                <div className="mt-2">
                  <Clock size={16} className="md:w-[18px] md:h-[18px] text-[#2f3339] dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {/* Start Time */}
                    <div>
                      <label className="block mb-2 text-[#2f3339] dark:text-gray-300 font-medium text-[9px] md:text-[10px] uppercase tracking-wider">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-[#2f3339] dark:text-gray-400 pointer-events-none z-10" size={12} />
                        <DatePicker
                          selected={getTimeDate(startTime, startDate)}
                          onChange={(date) => setStartTime(date ? moment(date).format("HH:mm") : "")}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full pl-7 md:pl-9 pr-2 md:pr-3 border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm px-2 md:px-3 py-2 md:py-2.5 text-[11px] md:text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                        />
                      </div>
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block mb-2 text-[#2f3339] dark:text-gray-300 font-medium text-[9px] md:text-[10px] uppercase tracking-wider">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-[#2f3339] dark:text-gray-400 pointer-events-none z-10" size={12} />
                        <DatePicker
                          selected={getTimeDate(endTime, endDate)}
                          onChange={(date) => setEndTime(date ? moment(date).format("HH:mm") : "")}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full pl-7 md:pl-9 pr-2 md:pr-3 border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm px-2 md:px-3 py-2 md:py-2.5 text-[11px] md:text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Selection */}
              <div className="flex items-center gap-2 md:gap-3 py-3 border-b border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30">
                <div>
                  <User size={16} className="md:w-[18px] md:h-[18px] text-[#2f3339] dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        type="button"
                        className="w-full border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm px-2.5 md:px-3 py-2 text-xs md:text-sm rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                      >
                        <span className="text-left truncate">{selectedDoctor || "Select Doctor"}</span>
                        <ChevronDown size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                      </motion.button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30 shadow-xl rounded-xl w-[85vw] max-w-[280px] text-xs md:text-sm z-50 p-1 max-h-60 overflow-y-auto">
                      {doctors.map((doctor) => (
                        <DropdownMenu.Item
                          key={doctor}
                          className="p-2 md:p-2.5 hover:bg-[#DFE0E2]/50 dark:hover:bg-[#1f1f1f]/70 cursor-pointer rounded-lg transition-all"
                          onSelect={() => setSelectedDoctor(doctor)}
                        >
                          {doctor}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

              {/* Category Selection */}
              <div className="flex items-center gap-2 md:gap-3 py-3 border-b border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30">
                <div>
                  <Tag size={16} className="md:w-[18px] md:h-[18px] text-[#2f3339] dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        type="button"
                        className="w-full border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm px-2.5 md:px-3 py-2 text-xs md:text-sm rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                      >
                        <span className="capitalize">{eventType}</span>
                        <ChevronDown size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                      </motion.button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30 shadow-xl rounded-xl w-[85vw] max-w-[280px] text-xs md:text-sm z-50 p-1">
                      {Object.keys(eventColors).map((type) => (
                        <DropdownMenu.Item
                          key={type}
                          className="p-2 md:p-2.5 hover:bg-[#DFE0E2]/50 dark:hover:bg-[#1f1f1f]/70 cursor-pointer rounded-lg transition-all capitalize"
                          onSelect={() => setEventType(type as EventType)}
                        >
                          {type}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Popover.Content>
  );
};

export default CreatePopover;