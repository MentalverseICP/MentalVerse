import { useState, useRef, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { X, ChevronDown, Plus, Trash2, Clock, User, Tag, Edit, ShoppingBag } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

type EventType = keyof typeof eventColors;

interface Event {
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  doctor?: string;
}

const initialEvents: Event[] = [
  {
    title: "Hand Infection",
    start: new Date(2025, 3, 4, 12, 30),
    end: new Date(2025, 3, 4, 13, 0),
    type: "consultation",
    doctor: "Dr. Smith",
  },
  {
    title: "Monthly Checkup",
    start: new Date(2025, 3, 6, 11, 30),
    end: new Date(2025, 3, 6, 12, 0),
    type: "routine",
    doctor: "Dr. Johnson",
  },
  {
    title: "Malaria Fever",
    start: new Date(2025, 3, 12),
    end: new Date(2025, 3, 15),
    type: "sick",
    doctor: "Dr. Williams",
  },
];

const eventColors = {
  emergency: "bg-[#074A2D]",
  examination: "bg-[#FECA57]",
  routine: "bg-[#F80D38]",
  consultation: "bg-[#18E614]",
  sick: "bg-[#18E614]",
};

const doctors = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", "Dr. Davis"];

// Helper function to calculate centered popover position
const getCenteredPopoverPosition = (
  clickX: number,
  clickY: number,
  popoverWidth: number,
  popoverHeight: number,
  calendarRect?: DOMRect
) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const padding = 20;

  let left = clickX;
  let top = clickY;

  // If calendar rect is provided, adjust relative to it
  if (calendarRect) {
    left = clickX - calendarRect.left + window.scrollX;
    top = clickY - calendarRect.top + window.scrollY;
  }

  // Check if popover would go off right edge
  if (left + popoverWidth > windowWidth - padding) {
    left = windowWidth - popoverWidth - padding;
  }

  // Check if popover would go off left edge
  if (left < padding) {
    left = padding;
  }

  // Check if popover would go off bottom edge
  if (top + popoverHeight > windowHeight - padding) {
    top = windowHeight - popoverHeight - padding;
  }

  // Check if popover would go off top edge
  if (top < padding) {
    top = padding;
  }

  // If still not fitting or completely off-screen, center it
  if (
    left < padding ||
    left + popoverWidth > windowWidth - padding ||
    top < padding ||
    top + popoverHeight > windowHeight - padding
  ) {
    left = Math.max(padding, (windowWidth - popoverWidth) / 2);
    top = Math.max(padding, (windowHeight - popoverHeight) / 2);
  }

  return { top, left };
};

const CustomCalendar = () => {
  const [events, setEvents] = useState(initialEvents);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("consultation");
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState("month");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [showEditPopover, setShowEditPopover] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      setEventTitle(selectedEvent.title);
      setEventType(selectedEvent.type);
      setStartTime(moment(selectedEvent.start).format("HH:mm"));
      setEndTime(moment(selectedEvent.end).format("HH:mm"));
      setSelectedDoctor(selectedEvent.doctor || "");
    }
  }, [selectedEvent]);

  const eventStyleGetter = (event: Event) => {
    return {
      className: `${eventColors[event.type] || "bg-transparent"} text-white p-1 px-3 rounded-xl shadow-md text-xs leading-3 w-[90%] mx-auto capitalize`,
    };
  };

  const handleViewChange = (newView: string) => {
    setCurrentView(newView);
  };

  const dayPropGetter = (date: Date) => {
    const isSelected = selectedSlots.some((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return date >= slotStart && date <= slotEnd;
    });

    if (isSelected) {
      return { className: "bg-gray-200 dark:bg-gray-700" };
    }

    return { className: "bg-transparent" };
  };

  const handleSelect = ({
    start,
    end,
    box,
  }: {
    start: Date;
    end: Date;
    box?: { x: number; y: number };
  }) => {
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() - 1);
    adjustedEnd.setHours(23, 59, 59, 999);

    setSelectedSlots([{ start, end: adjustedEnd }]);
    setSelectedEvent(null);
    setShowEditPopover(false);

    const popoverWidth = 420;
    const popoverHeight = 600;

    if (box) {
      const position = getCenteredPopoverPosition(
        box.x,
        box.y,
        popoverWidth,
        popoverHeight,
        calendarRef.current?.getBoundingClientRect()
      );
      setPopoverPosition(position);
    } else {
      // Default to center
      setPopoverPosition({
        top: Math.max(20, (window.innerHeight - popoverHeight) / 2),
        left: Math.max(20, (window.innerWidth - popoverWidth) / 2),
      });
    }
  };

  const handleEventClick = (event: Event, e: React.SyntheticEvent) => {
    if (selectedEvent && selectedEvent === event) {
      setSelectedEvent(null);
      return;
    }

    setSelectedEvent(event);
    setSelectedSlots([]);

    const mouseEvent = e as React.MouseEvent<HTMLElement>;
    const popoverWidth = 400;
    const popoverHeight = 400;

    const position = getCenteredPopoverPosition(
      mouseEvent.clientX,
      mouseEvent.clientY,
      popoverWidth,
      popoverHeight,
      calendarRef.current?.getBoundingClientRect()
    );

    setPopoverPosition(position);
  };

  const addOrUpdateEvent = () => {
    if (eventTitle.trim() && selectedSlots.length > 0 && startTime && endTime && selectedDoctor) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      const slot = selectedSlots[0];

      const start = new Date(slot.start);
      start.setHours(startHours || 0, startMinutes || 0);

      const end = new Date(slot.end);
      end.setHours(endHours || 0, endMinutes || 0);

      const newEvent = {
        title: eventTitle,
        start,
        end,
        type: eventType,
        doctor: selectedDoctor,
      };

      setEvents((prev) => [...prev, newEvent]);
      setSelectedSlots([]);
    } else if (selectedEvent) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const newStart = new Date(selectedEvent.start);
      newStart.setHours(startHours || moment(selectedEvent.start).hours(), startMinutes || moment(selectedEvent.start).minutes());

      const newEnd = new Date(selectedEvent.end);
      newEnd.setHours(endHours || moment(selectedEvent.end).hours(), endMinutes || moment(selectedEvent.end).minutes());

      setEvents((prev) =>
        prev.map((ev) =>
          ev === selectedEvent
            ? { ...ev, title: eventTitle, type: eventType, start: newStart, end: newEnd, doctor: selectedDoctor }
            : ev
        )
      );
      closeEditPopover();
    }
    closePopover();
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowEditPopover(true);
    setSelectedSlots([]);
  };

  const closeEditPopover = () => {
    setShowEditPopover(false);
    setSelectedEvent(null);
  };

  const deleteEvent = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((ev) => ev !== selectedEvent));
      closePopover();
    }
  };

  const closePopover = () => {
    setSelectedSlots([]);
    setSelectedEvent(null);
    setEventTitle("");
    setEventType("consultation");
    setStartTime("");
    setEndTime("");
    setSelectedDoctor("");
  };

  const slotPropGetter = (date: Date) => {
    const isSelected = selectedSlots.some((slot) => slot.start <= date && slot.end >= date);
    return {
      className: isSelected ? "bg-gray-200 dark:bg-gray-700" : "",
    };
  };

  // Edit Popover Component
  const EditPopover = ({ event }: { event: Event }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-2xl p-5 w-96 fixed z-50 border border-gray-200/20 dark:border-gray-700/30 overflow-hidden"
        style={{ top: popoverPosition.top, left: popoverPosition.left }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4 justify-between border-b border-gray-200/30 dark:border-gray-700/50 pb-4">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} className="w-11 h-11 bg-gradient-to-br from-gray-200/50 to-gray-200/30 dark:from-gray-700/50 dark:to-gray-700/30 rounded-full backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/50 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-transparent" />
              </motion.div>
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  {event.doctor || "No Doctor Assigned"}
                </h3>
                <p className="text-xs text-green-500 font-medium tracking-wider uppercase">Doctor</p>
              </div>
            </div>

            <div className="ml-auto flex justify-between gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleEdit(event)}
                className="p-2.5 rounded-xl border border-gray-200/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-black hover:border-white/50 transition-all hover:text-white text-black dark:hover:text-black dark:text-white dark:hover:bg-gray-200 hover:shadow-lg"
              >
                <Edit size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={closePopover}
                className="p-2.5 rounded-xl border border-gray-200/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-black hover:border-white/50 transition-all hover:text-white text-black dark:hover:text-black dark:text-white dark:hover:bg-gray-200 hover:shadow-lg"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/50 dark:bg-gray-700/30">
                <Clock size={14} className="text-black dark:text-white" />
              </div>
              <p className="text-xs font-medium text-black dark:text-white">
                {moment(event.start).format("h:mm A")}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-700/40">
              <span className={`rounded-full w-2 h-2 ${eventColors[event.type]} shadow-lg`}></span>
              <p className="text-xs uppercase font-bold tracking-wider text-black dark:text-white">
                {event.type}
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center">
              <span className="text-xs dark:text-white text-black px-3 py-1.5 rounded-full uppercase font-bold bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/30">
                {event.title.length > 11 ? event.title.slice(0, 11) + "..." : event.title}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Create Popover Component
  const CreatePopover = () => {
    const startDate = selectedEvent ? new Date(selectedEvent.start) : new Date();
    const endDate = selectedEvent ? new Date(selectedEvent.end) : new Date();

    const getTimeDate = (timeStr: string, baseDate: Date) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date(baseDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl text-black dark:text-white shadow-2xl rounded-2xl w-[95vw] max-w-[420px] max-h-[90vh] fixed z-50 border border-gray-200/20 dark:border-gray-700/30"
        style={{ top: popoverPosition.top, left: popoverPosition.left }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="border-b border-gray-200/30 dark:border-gray-700/50 px-5 py-3 flex justify-between items-center bg-white/50 dark:bg-gray-900/50">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="bg-gradient-to-r from-green-500/90 to-green-500/80 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-2"
                onClick={addOrUpdateEvent}
              >
                {selectedEvent ? <Edit size={14} /> : <Plus size={14} />}
                <span>{selectedEvent ? "Update" : "Create"}</span>
              </motion.button>

              {selectedEvent && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-red-500/30 text-red-500 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 flex items-center gap-2"
                  onClick={deleteEvent}
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/50 text-black dark:text-white p-2 rounded-lg hover:border-green-500 transition-all"
              onClick={selectedSlots.length > 0 ? closePopover : closeEditPopover}
            >
              <X size={16} />
            </motion.button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4">
            <div className="space-y-1">
              <div className="flex items-start gap-3 py-2">
                <div className="mt-2">
                  <Tag size={18} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full bg-transparent border-0 border-b hover:border-gray-200/50 dark:hover:border-gray-700/50 border-green-500 p-0 pb-2 focus:outline-none text-lg font-normal text-black dark:text-white placeholder:text-gray-400 transition-all"
                    placeholder="Add a title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-3 border-b border-gray-200/20 dark:border-gray-700/30">
                <div className="mt-2">
                  <Clock size={18} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-gray-600 dark:text-gray-300 font-medium text-xs uppercase tracking-wider">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none z-10" size={12} />
                        <DatePicker
                          selected={getTimeDate(startTime, startDate)}
                          onChange={(date) => setStartTime(date ? moment(date).format("HH:mm") : "")}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full pl-9 pr-3 border border-gray-200/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-600 dark:text-gray-300 font-medium text-xs uppercase tracking-wider">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none z-10" size={12} />
                        <DatePicker
                          selected={getTimeDate(endTime, endDate)}
                          onChange={(date) => setEndTime(date ? moment(date).format("HH:mm") : "")}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full pl-9 pr-3 border border-gray-200/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 border-b border-gray-200/20 dark:border-gray-700/30">
                <div>
                  <User size={18} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        type="button"
                        className="w-full border border-gray-200/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 text-sm rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                      >
                        <span className="text-left truncate">{selectedDoctor || "Select Doctor"}</span>
                        <ChevronDown size={16} className="flex-shrink-0" />
                      </motion.button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/30 shadow-xl rounded-xl w-[280px] text-sm z-50 p-1 max-h-60 overflow-y-auto">
                      {doctors.map((doctor) => (
                        <DropdownMenu.Item
                          key={doctor}
                          className="p-2.5 hover:bg-gray-200/50 dark:hover:bg-gray-800/70 cursor-pointer rounded-lg transition-all"
                          onSelect={() => setSelectedDoctor(doctor)}
                        >
                          {doctor}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 border-b border-gray-200/20 dark:border-gray-700/30">
                <div>
                  <Tag size={18} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        type="button"
                        className="w-full border border-gray-200/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 text-sm rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                      >
                        <span className="capitalize">{eventType}</span>
                        <ChevronDown size={16} className="flex-shrink-0" />
                      </motion.button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/30 shadow-xl rounded-xl w-[280px] text-sm z-50 p-1">
                      {Object.keys(eventColors).map((type) => (
                        <DropdownMenu.Item
                          key={type}
                          className="p-2.5 hover:bg-gray-200/50 dark:hover:bg-gray-800/70 cursor-pointer rounded-lg transition-all capitalize"
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
    );
  };

  return (
    <div ref={calendarRef} className="p-5 relative min-h-screen">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelect}
        onSelectEvent={handleEventClick}
        style={{ height: "calc(100vh - 8rem)" }}
        className="w-full"
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        slotPropGetter={slotPropGetter}
        popup
        onView={handleViewChange}
      />
      
      {selectedEvent && currentView === "month" && !showEditPopover && <EditPopover event={selectedEvent} />}
      {(selectedSlots.length > 0 || showEditPopover) && <CreatePopover />}
    </div>
  );
};

export default CustomCalendar;