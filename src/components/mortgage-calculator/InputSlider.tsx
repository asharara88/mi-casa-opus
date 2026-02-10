import { Slider } from '@/components/ui/slider';
import { formatAed } from '@/lib/money';

type Props = {
  label: string;
  value?: number;
  onChange: (v?: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: 'AED' | 'years' | '%';
  placeholder?: string;
};

export function InputSlider({ label, value, onChange, min, max, step, unit = 'AED', placeholder }: Props) {
  const handleManualChange = (raw: string) => {
    if (!raw) { onChange(undefined); return; }
    const n = Number(raw);
    if (isNaN(n)) return;
    onChange(Math.min(max, Math.max(min, n)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value != null && (
          <span className="text-sm font-semibold text-primary">
            {unit === 'AED' ? formatAed(value) : `${value} ${unit}`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Slider
          value={value != null ? [value] : [min]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <input
          className="w-28 border rounded-md px-2 py-1.5 text-sm bg-background text-foreground text-right"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => handleManualChange(e.target.value)}
        />
      </div>
    </div>
  );
}
