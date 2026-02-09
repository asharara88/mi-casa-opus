import { SourcedNumber } from '@/mortgage-data/types';

export function SourcesPanel({ used }: { used: SourcedNumber[] }) {
  if (!used.length) return null;
  return (
    <div className="border rounded-md p-3 space-y-3">
      <h3 className="font-semibold">Sources & Assumptions</h3>
      {used.map((s) => (
        <div key={s.id} className="text-xs border rounded-md p-2">
          <p className="font-medium">{s.label}: {s.value} {s.unit}</p>
          <p>{s.applies_to}</p>
          <p><strong>URL:</strong> {s.source.source_url}</p>
          <p><strong>Checked:</strong> {s.source.checked_on} (Asia/Dubai)</p>
        </div>
      ))}
    </div>
  );
}
