import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchImportedData, type ImportedDataResponse } from "../lib/api";

export function ImportedDataPage() {
  const [selectedFile, setSelectedFile] = useState<ImportedDataResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 20;

  const { data: importedFiles, isLoading, error } = useQuery({
    queryKey: ["importedData"],
    queryFn: fetchImportedData,
  });

  const handleViewData = (file: ImportedDataResponse) => {
    setSelectedFile(file);
    setCurrentPage(0);
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos importados. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  const totalPages = selectedFile ? Math.ceil(selectedFile.data.length / rowsPerPage) : 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/importar" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Volver a Importar
        </Link>
        <h1 className="text-3xl font-bold text-center flex-1">
          Archivos Excel Importados
        </h1>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ) : !importedFiles?.length ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              No hay archivos importados. 
              <Link href="/importar" className="text-primary hover:underline ml-1">
                Importar nuevo archivo
              </Link>
            </p>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Archivos Disponibles</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Archivo</TableHead>
                      <TableHead>Hoja</TableHead>
                      <TableHead>Fecha de Importación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.fileName}</TableCell>
                        <TableCell>{file.sheetName}</TableCell>
                        <TableCell>{formatDate(file.importedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewData(file)}
                          >
                            Ver Datos
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {selectedFile && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Datos de {selectedFile.fileName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm">
                        Página {currentPage + 1} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(selectedFile.data[0] || {}).map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedFile.data
                            .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
                            .map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value: any, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {value?.toString() || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
