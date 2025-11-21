import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { X, ChevronDown, Plus, ShoppingBag, Clock } from "lucide-react";
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

const Week$DayPopover = ({
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

  return (
    <Popover.Content
      className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl text-black dark:text-white shadow-2xl rounded-2xl p-5 w-80 max-h-[500px] absolute z-30 border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30 overflow-y-auto scrollbar-custom"
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
        
        <div className="relative z-10">
          <div className="border-b border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 pb-3 flex justify-between items-center mb-4">
            <h3 className="uppercase text-xs font-bold tracking-wider bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {selectedEvent ? 'Edit Appointment' : 'New Appointment'}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 text-black dark:text-white p-2 rounded-xl hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg hover:border-[#18E614]"
              onClick={closePopover}
              title="Close"
            >
              <X size={14} />
            </motion.button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-2 ml-1 text-[#2f3339] dark:text-gray-300 font-medium text-[10px] uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                className="w-full border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] placeholder:text-xs text-xs text-black dark:text-white transition-all"
                placeholder="Enter appointment title"
                id="title"
                name="title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block mb-2 ml-1 text-[#2f3339] dark:text-gray-300 font-medium text-[10px] uppercase tracking-wider">
                Category
              </label>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    className="w-full border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm p-2.5 text-xs rounded-xl flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                  >
                    <span className="capitalize">{eventType}</span>
                    <ChevronDown size={16} />
                  </motion.button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30 shadow-xl rounded-xl w-64 text-xs z-50 p-1">
                  {Object.keys(eventColors).map((type) => (
                    <DropdownMenu.Item
                      key={type}
                      className="p-2.5 hover:bg-[#DFE0E2]/50 dark:hover:bg-[#1f1f1f]/70 cursor-pointer rounded-lg transition-all capitalize"
                      onSelect={() => setEventType(type as EventType)}
                    >
                      {type}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>

            <div>
              <label htmlFor="doctor" className="block mb-2 ml-1 text-[#2f3339] dark:text-gray-300 font-medium text-[10px] uppercase tracking-wider">
                Doctor
              </label>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    className="w-full border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm p-2.5 text-xs rounded-xl flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                  >
                    <span>{selectedDoctor || "Select Doctor"}</span>
                    <ChevronDown size={16} />
                  </motion.button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-xl border border-[#DFE0E2]/20 dark:border-[#3D3D3D]/30 shadow-xl rounded-xl w-64 text-xs z-50 p-1 max-h-48 overflow-y-auto">
                  {doctors.map((doctor) => (
                    <DropdownMenu.Item
                      key={doctor}
                      className="p-2.5 hover:bg-[#DFE0E2]/50 dark:hover:bg-[#1f1f1f]/70 cursor-pointer rounded-lg transition-all"
                      onSelect={() => setSelectedDoctor(doctor)}
                    >
                      {doctor}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 ml-1 text-[#2f3339] dark:text-gray-300 font-medium text-[10px] uppercase tracking-wider">
                  Start
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2f3339] dark:text-gray-400 pointer-events-none z-10" size={14} />
                  <DatePicker
                    selected={startTime ? moment(startTime, "HH:mm").toDate() : null}
                    onChange={(date) => setStartTime(date ? moment(date).format("HH:mm") : "")}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    className="w-full pl-9 pr-3 border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm p-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                    onChangeRaw={(e) => {
                      if (e && e.target) {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9:]/g, "");
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 ml-1 text-[#2f3339] dark:text-gray-300 font-medium text-[10px] uppercase tracking-wider">
                  End
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2f3339] dark:text-gray-400 pointer-events-none z-10" size={14} />
                  <DatePicker
                    selected={endTime ? moment(endTime, "HH:mm").toDate() : null}
                    onChange={(date) => setEndTime(date ? moment(date).format("HH:mm") : "")}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    className="w-full pl-9 pr-3 border border-[#DFE0E2]/30 dark:border-[#3D3D3D]/50 bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm p-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18E614]/50 focus:border-[#18E614] transition-all"
                    onChangeRaw={(e) => {
                      if (e && e.target) {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9:]/g, "");
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 gap-2">
              {selectedEvent && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="bg-white/50 dark:bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#F80D38]/30 text-[#F80D38] p-2.5 rounded-xl transition-all duration-300 hover:bg-[#F80D38] hover:text-white hover:shadow-lg hover:shadow-[#F80D38]/20"
                  onClick={deleteEvent}
                  title="Delete Event"
                >
                  <ShoppingBag size={18} />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex-1 bg-gradient-to-r from-white/70 to-white/50 dark:from-[#1f1f1f]/70 dark:to-[#1f1f1f]/50 backdrop-blur-sm border border-[#18E614]/30 text-black dark:text-white px-4 py-2.5 rounded-xl transition-all duration-300 hover:border-[#18E614] hover:shadow-lg hover:shadow-[#18E614]/20"
                onClick={addOrUpdateEvent}
              >
                <div className="flex items-center justify-center gap-2">
                  {selectedEvent ? <Edit size={14} /> : <Plus size={14} />}
                  <span className="text-[11px] uppercase font-bold tracking-wider">
                    {selectedEvent ? "Update" : "Create"}
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </Popover.Content>
  );
};

export default Week$DayPopover;