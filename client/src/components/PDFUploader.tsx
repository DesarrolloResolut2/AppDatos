import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Alert } from "./ui/alert";
import { Progress } from "./ui/progress";

interface PDFUploaderProps {
  onPDFProcessed: (data: any) => void;
}

export function PDFUploader({ onPDFProcessed }: PDFUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Por favor, selecciona un archivo PDF válido');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar el archivo PDF');
      }

      const data = await response.json();
      onPDFProcessed(data);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload">
          <Button variant="outline" disabled={uploading}>
            {uploading ? 'Procesando...' : 'Seleccionar PDF'}
          </Button>
        </label>
        {uploading && (
          <Progress value={progress} className="w-full mt-4" />
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}
    </div>
  );
}
