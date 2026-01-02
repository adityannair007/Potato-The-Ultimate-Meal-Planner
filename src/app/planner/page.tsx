"use client";
import { RangeCalendar } from "@heroui/calendar";
import { today, getLocalTimeZone } from "@internationalized/date";

export default async function Planner() {
  return (
    <>
      <div className="flex gap-x-4">
        <RangeCalendar aria-label="Date (No Selection)" />
        <RangeCalendar
          aria-label="Date (Uncontrolled)"
          defaultValue={{
            start: today(getLocalTimeZone()),
            end: today(getLocalTimeZone()).add({ weeks: 1 }),
          }}
        />
      </div>
    </>
  );
}
