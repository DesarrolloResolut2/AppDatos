import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PdfDocument {
  id: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function PdfDocumentsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery<PdfDocument[]>({
    queryKey: ["pdfDocuments"],
    queryFn: async () => {
      const response = await fetch('/api/pdf-documents');
      if (!response.ok) {
        throw new Error('Error al cargar los documentos');
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
        throw new Error('Error al eliminar el documento');
      }

      await queryClient.invalidateQueries({ queryKey: ["pdfDocuments"] });
      setError(null);
    } catch (error) {
      setError("Error al eliminar el documento. Por favor, inténtelo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (id: number) => {
    setSelectedPdf(id);
    setPageNumber(1);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setPageNumber(page => numPages ? Math.min(numPages, page + 1) : page);
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
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver PDF
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
                <h3 className="text-lg font-semibold">Vista previa del PDF</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pageNumber <= 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {pageNumber} de {numPages || '?'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={numPages !== null && pageNumber >= numPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPdf(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cerrar
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                  <Document
                    file={`/api/pdf-documents/${selectedPdf}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                    error={
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Error al cargar el PDF. Por favor, inténtelo de nuevo.
                        </AlertDescription>
                      </Alert>
                    }
                    loading={
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      scale={1.2}
                    />
                  </Document>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
