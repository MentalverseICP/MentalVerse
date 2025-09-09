import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
  consultation: "bg-[#0DB16A]",
  sick: "bg-[#18E614]",
};

type EventType =
  | "emergency"
  | "examination"
  | "routine"
  | "consultation"
  | "sick";

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
  selectedEvent: any;
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
      className="bg-white dark:bg-black text-black dark:text-white shadow-xl rounded-xl p-6 w-64 absolute z-30 border border-[#DFE0E2] dark:border-[#3D3D3D]"
      style={{ top: popoverPosition.top, left: popoverPosition.left }}
    >
      <div>
        <div className="border-b border-[#2f3339] pb-2 flex justify-between items-center">
          <h3 className="uppercase text-xs font-bold">make new appointment</h3>
          <button
            type="button"
            className="bg-transparent border-[#2f3339] text-black dark:text-white p-2 rounded-full border-2 hover:-translate-y-0.5 transition-all duration-300 hover:bg-white dark:hover:bg-black hover:shadow-[0_2px_0_0_rgba(0, 38, 255, 0.976)] hover:border-[#1429e6] hover:border-b-[3px]"
            onClick={closePopover}
            title="Close"
          >
            <X size={12} />
          </button>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block mt-4 ml-1 text-[#2f3339] dark:text-gray-200 font-medium text-[10px] uppercase"
          >
            Title
          </label>
          <input
            type="text"
            className="w-full border border-[#2f3339] dark:border-[#2f3339] bg-transparent p-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[#18E614] placeholder:text-xs text-xs"
            placeholder="Enter Title"
            id="title"
            name="title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="eventType"
            className="block mt-4 ml-1 text-[#2f3339] dark:text-gray-200 font-medium text-[10px] uppercase"
          >
            Categories
          </label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="w-full border border-[#2f3339] dark:border-[#2f3339] bg-transparent p-1.5 text-xs rounded-full flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-[#18E614]"
              >
                {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                <ChevronDown size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white dark:bg-black border border-[#2f3339] dark:border-[#2f3339] shadow-md rounded-md w-44 text-xs z-10">
              {Object.keys(eventColors).map((type) => (
                <DropdownMenu.Item
                  key={type}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-[#2f3339] cursor-pointer"
                  onSelect={() => setEventType(type as EventType)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div>
          <label
            htmlFor="doctor"
            className="block mt-4 ml-1 text-[#2f3339] dark:text-gray-200 font-medium text-[10px] uppercase"
          >
            Doctors
          </label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="w-full border border-[#2f3339] dark:border-[#2f3339] bg-transparent p-1.5 text-xs rounded-full flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-[#18E614]"
              >
                {selectedDoctor || "Select Doctor"}
                <ChevronDown size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white dark:bg-black border border-[#2f3339] dark:border-[#2f3339] shadow-md rounded-md w-44 text-xs z-10">
              {doctors.map((doctor) => (
                <DropdownMenu.Item
                  key={doctor}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-[#2f3339] cursor-pointer"
                  onSelect={() => setSelectedDoctor(doctor)}
                >
                  {doctor}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div className="flex justify-between gap-5">
          <div className="flex flex-col">
            <label className="block mt-4 ml-1 text-[#2f3339] dark:text-gray-200 font-bold text-[10px] uppercase">
              Start Time
            </label>
            <div className="relative flex items-center">
              <Clock
                className="absolute left-2 text-[#2f3339] dark:text-gray-400"
                size={16}
              />
              <DatePicker
                selected={
                  startTime ? moment(startTime, "HH:mm").toDate() : null
                }
                onChange={(date) =>
                  setStartTime(date ? moment(date).format("HH:mm") : "")
                }
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                className="w-full pl-8 border border-[#2f3339] dark:border-[#2f3339] bg-transparent p-1.5 text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-[#18E614] hover:border-[#18E614] dark:hover:border-[#18E614]"
                onChangeRaw={(e) => {
                  if (e && e.target) {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9:]/g, "");
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block mt-4 ml-1 text-[#2f3339] dark:text-gray-200 font-bold text-[10px] uppercase">
              End Time
            </label>
            <div className="relative flex items-center">
              <Clock
                className="absolute left-2 text-[#2f3339] dark:text-gray-400"
                size={16}
              />
              <DatePicker
                selected={endTime ? moment(endTime, "HH:mm").toDate() : null}
                onChange={(date) =>
                  setEndTime(date ? moment(date).format("HH:mm") : "")
                }
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                className="w-full pl-8 border border-[#2f3339] dark:border-[#2f3339] bg-transparent p-1.5 text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-[#18E614] hover:border-[#18E614] dark:hover:border-[#18E614]"
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
        <div className="mt-4 flex justify-between">
          {selectedEvent && (
            <button
              type="button"
              className="bg-transparent border-[#2f3339] text-black dark:text-white p-2 rounded-full border hover:-translate-y-0.5 transition-all duration-300 hover:border-t hover:border-b hover:bg-white dark:hover:bg-black hover:shadow-[0_2px_0_0_rgb(255, 0, 81)] hover:border-[#e61414] hover:border-b-2"
              onClick={deleteEvent}
              title="Delete Event"
            >
              <ShoppingBag size={20} />
            </button>
          )}
          <button
            type="button"
            className="bg-transparent border-[#2f3339] text-black dark:text-white p-2 rounded-full border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b dark:bg-black dark:hover:bg-black dark:hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] dark:hover:border-[#18E614] bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]"
            onClick={addOrUpdateEvent}
          >
            {selectedEvent ? (
              <div className="flex items-center gap-1">
                <Edit size={10} />
                <span className="block text-[#2f3339] dark:text-gray-200 font-bold dark:font-medium text-[10px] uppercase">
                  Edit appointment
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Plus size={10} />
                <span className="block text-[#2f3339] dark:text-gray-200 font-bold dark:font-medium text-[10px] uppercase">
                  New appointment
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </Popover.Content>
  );
};

export default Week$DayPopover;
