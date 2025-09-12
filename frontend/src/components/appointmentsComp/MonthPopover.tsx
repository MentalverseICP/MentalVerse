import React from "react";
import { ShoppingBag, Clock } from "lucide-react";
import { Edit } from 'lucide-react';
import moment from "moment";

interface MonthPopoverProps {
    event: Event;
    onClose: () => void;
    style?: React.CSSProperties;
    onEdit: (event: Event) => void; 
}

const eventColors: { [key: string]: string } = {
    emergency: "bg-[#074A2D]",
    examination: "bg-[#FECA57]",
    routine: "bg-[#F80D38]",
    consultation: "bg-[#0DB16A]",
    sick: "bg-[#18E614]",
};

type EventType = 'emergency' | 'examination' | 'routine' | 'consultation' | 'sick';

interface Event {
    doctor: string;
    start: Date;
    end: Date;
    type: EventType;
    title: string;
}

const MonthPopover = ({ event, onClose, style = {}, onEdit }: MonthPopoverProps) => {
    return (
        <div className="bg-white dark:bg-black shadow-xl rounded-xl p-4 w-96 absolute z-50 border border-[#DFE0E2] dark:border-[#3D3D3D]" style={style}>
            <div className="flex items-center space-x-2 mb-3 justify-between border-b-2 border-[#DFE0E2] pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#DFE0E2] dark:bg-[#3D3D3D] rounded-full"></div>
                    <div>
                        <h3 className="text-sm font-semibold">{event.doctor}</h3>
                        <p className="text-xs text-green-600">DOCTOR</p>
                    </div>
                </div>

                <div className="ml-auto flex justify-between gap-3">
                    <button
                        title="button"
                        type="button"
                        onClick={() => onEdit(event)} // Pass event to onEdit
                        className="p-2 rounded-full border border-[#DFE0E2] hover:bg-black hover:border-white transition-all hover:text-white text-black dark:hover:text-black dark:text-white dark:hover:bg-[#DFE0E2]"
                    >
                        <Edit size={14} fill="1" />
                    </button>
                    <button title="button" type="button" onClick={onClose} className="p-2 rounded-full border border-[#DFE0E2] hover:bg-black hover:border-white transition-all hover:text-white text-black dark:hover:text-black dark:text-white dark:hover:bg-[#DFE0E2]">
                        <ShoppingBag size={16} fill="1" />
                    </button>
                </div>
            </div>
            <div className="flex items-center space-x-2 gap-5">
                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <p className="text-xs">{moment(event.start).format("h:mm A")}</p>
                </div>
                <div className="flex justify-between gap-2 items-center">
                    <span className={`rounded-full w-2 h-2 ${eventColors[event.type]}`}></span>
                    <p className="text-xs uppercase font-bold tracking-wide">{event.type}</p>
                </div>
                <div className="flex space-x-1 ml-auto">
                    <span className="text-xs dark:text-white text-black px-2 pl-4 py-0.5 rounded-full uppercase font-bold">
                        {
                            event.title.length > 11 ? event.title.slice(0, 11) + "..." : event.title
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MonthPopover;