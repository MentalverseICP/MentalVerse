import { useState, useRef, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
// import "tailwindcss/tailwind.css";
import * as Popover from "@radix-ui/react-popover";

import { useSidebar } from "@/components/ui/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import MonthPopover from "@/components/appointmentsComp/MonthPopover";
import Week$DayPopover from "@/components/appointmentsComp/Week$DayPopover";

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
  consultation: "bg-[#0DB16A]",
  sick: "bg-[#18E614]",
};

const CustomCalendar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents
      ? JSON.parse(savedEvents, (key, value) =>
          key === "start" || key === "end" ? new Date(value) : value
        )
      : initialEvents;
  });

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    start: Date;
    end: Date;
    type: EventType;
    doctor?: string;
  } | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<
    { start: Date; end: Date }[]
  >([]);

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("consultation");

  const [popoverPosition, setPopoverPosition] = useState({
    top: 200,
    left: 50,
  });
  const calendarRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState("month");

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [showEditPopover, setShowEditPopover] = useState(false);

  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (selectedEvent) {
      setEventTitle(selectedEvent.title);
      setEventType(selectedEvent.type);
      setStartTime(moment(selectedEvent.start).format("HH:mm"));
      setEndTime(moment(selectedEvent.end).format("HH:mm"));
      setSelectedDoctor(selectedEvent.doctor || "");
    }
  }, [selectedEvent]);

  const eventStyleGetter = (event: {
    title: string;
    start: Date;
    end: Date;
    type: EventType;
  }) => {
    return {
      className: `${
        eventColors[event.type] || "bg-transparent"
      } text-white p-0.5 lg:p-1 px-3 rounded-xl shadow-md text-[10px] leading-3 w-[90%] mx-auto capitalize`,
    };
  };

  const handleViewChange = (newView: string) => {
    //
    setCurrentView(newView);
  };

  const dayPropGetter = (date: Date) => {
    const isSelected = selectedSlots.some((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      return date >= slotStart && date <= slotEnd;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    if (isSelected) {
      return { className: "bg-gray-200 dark:bg-gray-700" }; // Apply gray background
    } else if (
      date < today &&
      (date < firstDayOfMonth || date > lastDayOfMonth)
    ) {
      return { className: "dark:bg-[#080827] dark:text-gray-400" };
    } else if (date.toDateString() === today.toDateString()) {
      return { className: "dark:bg-[#1f1f1f] dark:text-white" };
    } else if (
      date > today &&
      (date < firstDayOfMonth || date > lastDayOfMonth)
    ) {
      return { className: "dark:bg-[#080827] dark:text-[#2f3339]" };
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
    // Ensure the end date is the end of the selected day
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() - 1); // Subtract one day
    adjustedEnd.setHours(23, 59, 59, 999); // Set to the end of the day

    setSelectedSlots((prev) => [...prev, { start, end: adjustedEnd }]);
    setSelectedEvent(null);
    setShowEditPopover(false);

    if (box && calendarRef.current) {
      const calendarRect = calendarRef.current.getBoundingClientRect();
      let left = box.x - calendarRect.left + window.scrollX;
      let top = box.y - calendarRect.top + window.scrollY;

      const popoverWidth = 300;
      const popoverHeight = 400;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (left + popoverWidth > windowWidth) {
        left = windowWidth - popoverWidth - 20;
      }
      if (top + popoverHeight > windowHeight) {
        top = windowHeight - popoverHeight - 20;
      }

      setPopoverPosition({ top, left });
    }

    setSelectedEvent(null);
  };

  const handleEventClick = (
    event: { title: string; start: Date; end: Date; type: EventType },
    e: React.SyntheticEvent
  ) => {
    if (selectedEvent && selectedEvent === event) {
      // If clicking the same event again, deselect it
      setSelectedEvent(null);
      return;
    }

    setSelectedEvent(event);
    setSelectedSlots([]);

    const mouseEvent = e as React.MouseEvent<HTMLElement>;

    if (calendarRef.current) {
      const calendarRect = calendarRef.current.getBoundingClientRect();
      let left = mouseEvent.clientX - calendarRect.left + window.scrollX;
      let top = mouseEvent.clientY - calendarRect.top + window.scrollY;

      const popoverWidth = isCollapsed ? 500 : 700;
      const popoverHeight = 400;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (left + popoverWidth > windowWidth) {
        left = windowWidth - popoverWidth - 20;
      }
      if (top + popoverHeight > windowHeight) {
        top = windowHeight - popoverHeight - 20;
      }

      setPopoverPosition({ top, left });
    }
  };

  const addOrUpdateEvent = () => {
    if (
      eventTitle.trim() &&
      selectedSlots.length > 0 &&
      startTime &&
      endTime &&
      selectedDoctor
    ) {
      // Add new event
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
        type: eventType as EventType,
        doctor: selectedDoctor,
      };

      setEvents((prev: typeof initialEvents) => [...prev, newEvent]);
      setSelectedSlots([]);
    } else if (selectedEvent) {
      // Update event

      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const newStart = new Date(selectedEvent.start);
      // Keep the original date and update hours and minutes
      newStart.setHours(
        startHours || moment(selectedEvent.start).hours(),
        startMinutes || moment(selectedEvent.start).minutes()
      );

      const newEnd = new Date(selectedEvent.end);
      // Keep the original date and update hours and minutes
      newEnd.setHours(
        endHours || moment(selectedEvent.end).hours(),
        endMinutes || moment(selectedEvent.end).minutes()
      );

      setEvents((prev: typeof initialEvents) =>
        prev.map((ev) =>
          ev === selectedEvent
            ? {
                ...ev,
                title: eventTitle,
                type: eventType as EventType,
                start: newStart,
                end: newEnd,
                doctor: selectedDoctor,
              }
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
      setEvents((prev: typeof initialEvents) =>
        prev.filter((ev) => ev !== selectedEvent)
      );
      closePopover();
    }
  };

  const closePopover = () => {
    setSelectedSlots([]);
    setSelectedEvent(null);
    setEventTitle("");
    setEventType("consultation");
  };

  const slotPropGetter = (date: Date) => {
    const isSelected = selectedSlots.some(
      (slot) => slot.start <= date && slot.end >= date
    );
    return {
      className: isSelected ? "bg-gray-200 dark:bg-gray-700" : "",
    };
  };

  return (
    <div
      ref={calendarRef}
      className={`p-5 relative max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 
      max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] 
      transition-all dark:bg-transparent 
      scrollbar-custom overflow-x-scroll grid 
      ${isCollapsed ? "grid-cols-1" : "grid-cols-1"}`}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelect}
        onSelectEvent={handleEventClick}
        style={{ height: "100%" }}
        className={`w-full max-[640px]:min-w-[600px] max-sm:w-screen  max-sm:-mr-5`}
        eventPropGetter={(event) => eventStyleGetter(event)}
        dayPropGetter={dayPropGetter}
        slotPropGetter={slotPropGetter}
        popup
        onView={handleViewChange}
      />
      {selectedEvent && currentView === "month" && !showEditPopover && (
        <Popover.Root
          open={true}
          onOpenChange={(open) => !open && closePopover()}
        >
          <Popover.Trigger asChild>
            <button type="button" className="hidden" aria-hidden="true" />
          </Popover.Trigger>
          <MonthPopover
            event={selectedEvent}
            onClose={closePopover}
            style={{ top: popoverPosition.top, left: popoverPosition.left }}
            onEdit={handleEdit}
          />
        </Popover.Root>
      )}

      {(selectedSlots.length > 0 || showEditPopover) && (
        <Popover.Root
          open={true}
          onOpenChange={(open) =>
            !open &&
            (selectedSlots.length > 0 ? closePopover() : closeEditPopover())
          }
        >
          <Popover.Trigger asChild>
            <button type="button" className="hidden" aria-hidden="true" />
          </Popover.Trigger>
          <Week$DayPopover
            closePopover={
              selectedSlots.length > 0 ? closePopover : closeEditPopover
            }
            popoverPosition={popoverPosition}
            eventTitle={eventTitle}
            setEventTitle={setEventTitle}
            eventType={eventType as EventType}
            setEventType={setEventType}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            addOrUpdateEvent={addOrUpdateEvent}
            selectedEvent={selectedEvent}
            deleteEvent={deleteEvent}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
          />
        </Popover.Root>
      )}
    </div>
  );
};

export default CustomCalendar;
