import { useState } from "react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

export function ImportExcelPage() {
  const [fileData, setFileData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const rowsPerPage = 20; // Mostrar 20 filas por página

  const totalPages = Math.ceil(fileData.length / rowsPerPage);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(0);
      setCurrentPage(0); // Reset page when new file is uploaded
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setUploadProgress(30);
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          setUploadProgress(60);
          setFileData(jsonData);
          
          try {
            const response = await fetch('/api/import-excel', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                data: jsonData,
                fileName: file.name,
                sheetName: sheetName
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || errorData.details || 'Error al importar los datos');
            }

            setError(null);
            const result = await response.json();
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-in fade-in duration-300';
            successMessage.textContent = '¡Archivo importado correctamente!';
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
              successMessage.classList.add('animate-out', 'fade-out');
              setTimeout(() => successMessage.remove(), 300);
            }, 3000);
            
            setUploadProgress(100);
            setTimeout(() => {
              setIsLoading(false);
              setUploadProgress(0);
            }, 500);
          } catch (err) {
            const errorData = err instanceof Error ? err.message : 'Error desconocido';
            console.error('Error detallado:', err);
            
            let errorMessage = 'Error al procesar el archivo';
            if (typeof errorData === 'string' && errorData.includes(':')) {
              errorMessage = errorData.split(':')[1].trim();
            } else if (typeof errorData === 'object' && errorData !== null) {
              errorMessage = (errorData as any).message || errorMessage;
            }
            
            setError(errorMessage);
            setIsLoading(false);
            setUploadProgress(0);
          }
        } catch (err) {
          setError('Error al procesar el archivo Excel');
          setIsLoading(false);
          setUploadProgress(0);
        }
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
        setIsLoading(false);
        setUploadProgress(0);
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      setError('Error al procesar el archivo: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Volver a inicio
        </Link>
        <h1 className="text-3xl font-bold text-center flex-1">
          Importar Datos desde Excel
        </h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Subir archivo Excel</h2>
            <p className="text-sm text-gray-600">
              Seleccione un archivo Excel (.xlsx o .csv) para importar los datos.
              El archivo debe contener las columnas necesarias para el tipo de datos que desea importar.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isLoading && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Procesando archivo... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fileData.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vista previa de los datos</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
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
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(fileData[0] || {}).map((header) => (
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
                    {fileData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((row, index) => (
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
          </Card>
        )}
      </div>
    </div>
  );
}
