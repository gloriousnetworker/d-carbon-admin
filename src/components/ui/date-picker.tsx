"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

export interface DatePickerProps {
  /** Currently selected date */
  selected?: Date;
  /** Handler when a new date is selected */
  onChange: (date: Date) => void;
  /** Additional class names for the trigger button */
  className?: string;
}

export function DatePicker({ selected, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start bg-white text-gray-900",
            className
          )}
        >
          {selected ? (
            format(selected, "PPP")
          ) : (
            <span className="text-muted-foreground">Select date</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date: Date | undefined) => {
            if (date) {
              onChange(date);
              setOpen(false);
            }
          }}
          className="bg-white"
          classNames={{
            popover: "p-4",
            month: "bg-white",
            day: "hover:bg-gray-100 focus:bg-gray-100",
            day_selected: "bg-blue-600 text-white hover:bg-blue-700",
            caption: "text-lg font-medium text-gray-800",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
