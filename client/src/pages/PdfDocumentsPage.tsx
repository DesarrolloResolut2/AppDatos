import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";

interface PdfDocument {
  id: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

interface PdfContent {
  fileName: string;
  text: string;
  numPages: number;
  info: any;
}

export function PdfDocumentsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<number | null>(null);
  const [pdfContent, setPdfContent] = useState<PdfContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery<PdfDocument[]>({
    queryKey: ["pdfDocuments"],
    queryFn: async () => {
      const response = await fetch('/api/pdf-documents');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar los documentos');
      }
      return response.json();
    },
  });

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/pdf-documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el documento');
      }

      await queryClient.invalidateQueries({ queryKey: ["pdfDocuments"] });
      if (selectedPdf === id) {
        setSelectedPdf(null);
        setPdfContent(null);
      }
      setError(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError("Error al eliminar el documento. Por favor, inténtelo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = async (id: number) => {
    try {
      setIsLoadingContent(true);
      setError(null);
      setSelectedPdf(id);
      
      console.log(`Solicitando contenido del PDF ${id}...`);
      const response = await fetch(`/api/pdf-documents/${id}/content`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Error al obtener el contenido del PDF');
      }

      const content = await response.json();
      console.log(`Contenido del PDF ${id} recibido:`, { 
        fileName: content.fileName,
        numPages: content.numPages,
        textLength: content.text?.length 
      });

      if (!content.text) {
        throw new Error('El PDF está vacío o no se pudo extraer el texto');
      }

      setPdfContent(content);
    } catch (error) {
      console.error('Error al cargar el PDF:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el contenido del PDF');
      setPdfContent(null);
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Volver a inicio
          </Link>
          <Link href="/upload-pdf" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Subir nuevo PDF
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center flex-1">
          Documentos PDF
        </h1>
      </div>

      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-center text-muted-foreground">
                Cargando documentos...
              </p>
            </div>
          ) : !documents?.length ? (
            <p className="text-center text-muted-foreground">
              No hay documentos PDF guardados.
              <Link href="/upload-pdf" className="text-primary hover:underline ml-1">
                Subir nuevo documento
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del archivo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha de subida</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc.id)}
                          disabled={isLoadingContent}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {isLoadingContent && selectedPdf === doc.id ? 'Cargando...' : 'Ver PDF'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {selectedPdf && (
          <Card className="p-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Contenido del PDF: {pdfContent?.fileName}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPdf(null);
                    setPdfContent(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cerrar
                </Button>
              </div>

              {isLoadingContent ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pdfContent ? (
                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {pdfContent.text}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error al cargar el contenido del PDF
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
