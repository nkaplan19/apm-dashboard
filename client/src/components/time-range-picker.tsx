import { useState } from "react";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
  className?: string;
}

const presetRanges = [
  {
    label: "Last hour",
    getValue: () => ({
      start: new Date(Date.now() - 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    label: "Last 6 hours", 
    getValue: () => ({
      start: new Date(Date.now() - 6 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    label: "Last 24 hours",
    getValue: () => ({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    label: "Last 7 days",
    getValue: () => ({
      start: subDays(new Date(), 7),
      end: new Date(),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      start: subDays(new Date(), 30),
      end: new Date(),
    }),
  },
];

export function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [customStart, setCustomStart] = useState<Date | undefined>(value.start);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(value.end);

  const handlePresetSelect = (presetValue: string) => {
    const preset = presetRanges.find(p => p.label === presetValue);
    if (preset) {
      const range = preset.getValue();
      onChange({
        start: range.start,
        end: range.end,
        label: preset.label,
      });
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd && customStart <= customEnd) {
      onChange({
        start: startOfDay(customStart),
        end: endOfDay(customEnd),
        label: `${format(customStart, 'MMM d')} - ${format(customEnd, 'MMM d')}`,
      });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="secondary" 
          className={cn("flex items-center space-x-2 justify-between min-w-[200px]", className)}
          data-testid="button-time-range"
        >
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{value.label}</span>
          </div>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "preset" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("preset")}
              data-testid="button-preset-mode"
            >
              Presets
            </Button>
            <Button
              variant={mode === "custom" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("custom")}
              data-testid="button-custom-mode"
            >
              Custom
            </Button>
          </div>

          {mode === "preset" && (
            <div className="space-y-2 min-w-[150px]">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handlePresetSelect(preset.label)}
                  data-testid={`preset-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          {mode === "custom" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  initialFocus
                  data-testid="calendar-start"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  disabled={(date) => customStart ? date < customStart : false}
                  data-testid="calendar-end"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd || customStart > customEnd}
                  data-testid="button-apply"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}