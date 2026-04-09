import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useImportProspectsCSV } from '@/hooks/useProspects';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProspectImportModal({ open, onOpenChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [rowCount, setRowCount] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const importCSV = useImportProspectsCSV();

  const countCSVRows = (text: string): number => {
    const lines = text.trim().split('\n');
    return Math.max(0, lines.length - 1); // Subtract header row
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
        const count = countCSVRows(text);
        setRowCount(count);
        setCsvContent(text);
        
        if (count === 0) {
          setParseError('No data rows found in CSV file.');
        }
      } catch (err) {
        setParseError('Failed to read CSV file. Please check the format.');
        setCsvContent('');
        setRowCount(0);
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
    if (!csvContent || rowCount === 0) return;
    
    setImporting(true);
    setProgress(0);
    
    try {
      // Simulate progress while edge function processes
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 90));
      }, 500);
      
      await importCSV.mutateAsync(csvContent);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 1000);
    } catch (error) {
      // Error handled by mutation
      setProgress(0);
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCsvContent('');
    setRowCount(0);
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
                  Found {rowCount.toLocaleString()} prospects ready to import
                </div>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress < 100 ? 'Importing prospects via server...' : 'Import complete!'}
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
              disabled={rowCount === 0 || importing || !!parseError}
            >
              {importing ? 'Importing...' : `Import ${rowCount.toLocaleString()} Prospects`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
