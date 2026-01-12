import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { format, addDays, addHours, setHours, setMinutes } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { NEXT_ACTION_OPTIONS } from '@/components/pipeline/NextActionBadge';

type NextActionType = Database['public']['Enums']['next_action_type'];

interface NextActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'Lead' | 'Deal';
  entityName: string;
  currentAction?: NextActionType | null;
  currentDueDate?: string | null;
  onConfirm: (action: NextActionType, dueDate: Date) => void;
}

const QUICK_OPTIONS = [
  { label: 'In 1 hour', getValue: () => addHours(new Date(), 1) },
  { label: 'Later today', getValue: () => setHours(setMinutes(new Date(), 0), 17) },
  { label: 'Tomorrow AM', getValue: () => setHours(setMinutes(addDays(new Date(), 1), 0), 9) },
  { label: 'Tomorrow PM', getValue: () => setHours(setMinutes(addDays(new Date(), 1), 0), 14) },
  { label: 'Next week', getValue: () => setHours(setMinutes(addDays(new Date(), 7), 0), 10) },
];

export function NextActionModal({
  open,
  onOpenChange,
  entityType,
  entityName,
  currentAction,
  currentDueDate,
  onConfirm,
}: NextActionModalProps) {
  const [action, setAction] = useState<NextActionType | ''>(currentAction || '');
  const [date, setDate] = useState<Date | undefined>(
    currentDueDate ? new Date(currentDueDate) : undefined
  );
  const [time, setTime] = useState<string>(
    currentDueDate ? format(new Date(currentDueDate), 'HH:mm') : '09:00'
  );

  const handleConfirm = () => {
    if (!action || !date) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const dueDate = setMinutes(setHours(date, hours), minutes);
    
    onConfirm(action, dueDate);
    onOpenChange(false);
    
    // Reset form
    setAction('');
    setDate(undefined);
    setTime('09:00');
  };

  const handleQuickOption = (getValue: () => Date) => {
    const quickDate = getValue();
    setDate(quickDate);
    setTime(format(quickDate, 'HH:mm'));
  };

  const isValid = action && date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Next Action</DialogTitle>
          <DialogDescription>
            Define the next step for {entityType.toLowerCase()}: {entityName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Action Type */}
          <div className="space-y-2">
            <Label>Action Type *</Label>
            <Select value={action} onValueChange={(v) => setAction(v as NextActionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select action type..." />
              </SelectTrigger>
              <SelectContent>
                {NEXT_ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Options */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Quick Schedule</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickOption(option.getValue)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label>Time *</Label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Preview */}
          {date && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Due:</p>
              <p className="text-sm font-medium">
                {format(setMinutes(setHours(date, parseInt(time.split(':')[0])), parseInt(time.split(':')[1])), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Save Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
