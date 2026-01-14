import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBulkInsertProspects, ProspectInsert } from '@/hooks/useProspects';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProspectImportModal({ open, onOpenChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProspectInsert[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const bulkInsert = useBulkInsertProspects();

  const parseCSV = (text: string): ProspectInsert[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const prospects: ProspectInsert[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim().replace(/"/g, '') || '';
      });
      
      // Map CSV columns to our schema
      const prospect: ProspectInsert = {
        first_name: row['first_name'] || null,
        last_name: row['last_name'] || null,
        full_name: row['full_name'] || `${row['first_name'] || ''} ${row['last_name'] || ''}`.trim() || 'Unknown',
        phone: row['phone'] || null,
        email: row['email'] || null,
        source: row['source'] || null,
        city: row['city'] || null,
        crm_customer_id: row['crm_customer_id'] || null,
        crm_created_date: row['crm_created_date'] || null,
        crm_stage: row['crm_stage'] || 'Prospect',
        crm_confidence_level: row['crm_confidence_level'] || null,
        outreach_status: 'not_contacted',
      };
      
      prospects.push(prospect);
    }
    
    return prospects;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile) return;

    setFile(csvFile);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        setParsedData(data);
      } catch (err) {
        setParseError('Failed to parse CSV file. Please check the format.');
        setParsedData([]);
      }
    };
    reader.readAsText(csvFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    
    setImporting(true);
    setProgress(0);
    
    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);
      
      await bulkInsert.mutateAsync(parsedData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onOpenChange(false);
        setFile(null);
        setParsedData([]);
        setProgress(0);
      }, 1000);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setParseError(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!importing) { onOpenChange(o); reset(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Prospects</DialogTitle>
          <DialogDescription>
            Upload a CSV file with prospect data for cold outreach.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? 'Drop CSV file here' : 'Drag & drop a CSV file, or click to browse'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {!importing && (
                  <Button variant="ghost" size="sm" onClick={reset}>
                    Change
                  </Button>
                )}
              </div>

              {parseError ? (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {parseError}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Found {parsedData.length.toLocaleString()} prospects ready to import
                </div>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress < 100 ? 'Importing prospects...' : 'Import complete!'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={parsedData.length === 0 || importing || !!parseError}
            >
              {importing ? 'Importing...' : `Import ${parsedData.length.toLocaleString()} Prospects`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
