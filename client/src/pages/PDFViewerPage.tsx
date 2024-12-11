import { useState } from 'react';
import { PDFUploader } from '../components/PDFUploader';
import { Table } from '../components/ui/table';
import { Card } from '../components/ui/card';

interface PDFData {
  headers: string[];
  rows: string[][];
}

export function PDFViewerPage() {
  const [pdfData, setPDFData] = useState<PDFData | null>(null);

  const handlePDFProcessed = (data: PDFData) => {
    setPDFData(data);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Ver documentos PDF</h1>
      
      <Card className="p-4">
        <PDFUploader onPDFProcessed={handlePDFProcessed} />
      </Card>

      {pdfData && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  {pdfData.headers.map((header, index) => (
                    <th key={index} className="px-4 py-2">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pdfData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border px-4 py-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
