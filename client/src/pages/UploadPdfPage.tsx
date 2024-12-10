import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UploadPdfPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [_, setLocation] = useLocation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setSelectedFileName(file.name);

    try {
      setUploadProgress(30);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setUploadProgress(60);
          const base64Content = e.target?.result?.toString().split(',')[1];
          
          if (!base64Content) {
            throw new Error('Error al leer el archivo');
          }

          const response = await fetch('/api/pdf-documents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              fileContent: base64Content,
              fileSize: file.size,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al subir el PDF');
          }

          setUploadProgress(100);
          setTimeout(() => {
            setLocation('/pdf-documents');
          }, 500);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Error al procesar el archivo');
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al procesar el archivo');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Volver a inicio
        </Link>
        <Link href="/pdf-documents" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Ver documentos PDF
        </Link>
        <h1 className="text-3xl font-bold text-center flex-1">
          Subir Documento PDF
        </h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {selectedFileName && !error && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {selectedFileName}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
