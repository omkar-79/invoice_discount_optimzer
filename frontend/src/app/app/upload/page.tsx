"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import { useImportInvoices } from "@/hooks/use-api";
import { SAMPLE_CSV } from "@/lib/constants";
import { copy } from "@/lib/i18n";

interface CSVColumn {
  header: string;
  required: boolean;
  mappedTo?: string;
}

interface CSVRow {
  [key: string]: string;
}

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [columns, setColumns] = useState<CSVColumn[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  const router = useRouter();
  const importMutation = useImportInvoices();

  const requiredFields = [
    { key: "vendor", label: "Vendor", description: "Company name" },
    { key: "invoice_number", label: "Invoice Number", description: "Unique invoice ID" },
    { key: "amount", label: "Amount", description: "Invoice total" },
    { key: "invoice_date", label: "Invoice Date", description: "Date invoice was issued" },
    { key: "due_date", label: "Due Date", description: "Payment due date" },
    { key: "terms", label: "Terms", description: "Payment terms (e.g., 2/10 net 30)" },
  ];

  const optionalFields = [
    { key: "notes", label: "Notes", description: "Additional information" },
    { key: "currency", label: "Currency", description: "Currency code (USD, EUR, etc.)" },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      parseCSV(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvData(rows);
      
      // Initialize columns
      const detectedColumns: CSVColumn[] = headers.map(header => ({
        header,
        required: false,
      }));
      setColumns(detectedColumns);
      
      setCurrentStep(2);
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (header: string, mappedTo: string) => {
    setMapping(prev => ({
      ...prev,
      [header]: mappedTo,
    }));
  };

  const validateData = () => {
    const errors: Record<string, string[]> = {};
    
    csvData.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Check required fields
      requiredFields.forEach(field => {
        const mappedHeader = Object.keys(mapping).find(h => mapping[h] === field.key);
        if (mappedHeader && (!row[mappedHeader] || row[mappedHeader].trim() === '')) {
          rowErrors.push(`${field.label} is required`);
        }
      });
      
      // Validate amount
      const amountHeader = Object.keys(mapping).find(h => mapping[h] === 'amount');
      if (amountHeader && row[amountHeader]) {
        const amount = parseFloat(row[amountHeader]);
        if (isNaN(amount) || amount <= 0) {
          rowErrors.push('Amount must be a positive number');
        }
      }
      
      // Validate dates
      const dateHeaders = ['invoice_date', 'due_date'];
      dateHeaders.forEach(dateField => {
        const mappedHeader = Object.keys(mapping).find(h => mapping[h] === dateField);
        if (mappedHeader && row[mappedHeader]) {
          const date = new Date(row[mappedHeader]);
          if (isNaN(date.getTime())) {
            rowErrors.push(`${dateField.replace('_', ' ')} must be a valid date`);
          }
        }
      });
      
      if (rowErrors.length > 0) {
        errors[`row_${index}`] = rowErrors;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Validate mapping
      const requiredMappings = requiredFields.map(f => f.key);
      const mappedFields = Object.values(mapping);
      const missingFields = requiredMappings.filter(field => !mappedFields.includes(field));
      
      if (missingFields.length > 0) {
        alert(`Please map all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateData()) {
        setCurrentStep(4);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await importMutation.mutateAsync(new FormData());
      router.push('/app/dashboard');
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{copy.upload.title}</h1>
        <p className="text-muted-foreground">
          Upload your invoice data to get personalized discount recommendations
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
            </div>
            {step < 4 && (
              <div className={`
                w-16 h-1 mx-2
                ${currentStep > step ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{copy.upload.step1.title}</CardTitle>
            <CardDescription>{copy.upload.step1.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${uploadedFile ? 'border-primary bg-primary/5' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {uploadedFile ? (
                <div>
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {copy.upload.step1.acceptedFormats}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {copy.upload.step1.acceptedFormats}
                  </p>
                  <Button variant="outline">
                    Choose File
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="link" onClick={downloadSampleCSV}>
                <Download className="h-4 w-4 mr-2" />
                {copy.upload.step1.sampleCsv}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{copy.upload.step2.title}</CardTitle>
            <CardDescription>{copy.upload.step2.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Required Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="flex items-center">
                        {field.label}
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Required
                        </Badge>
                      </Label>
                      <Select
                        value={Object.keys(mapping).find(h => mapping[h] === field.key) || ''}
                        onValueChange={(value) => handleMappingChange(value, field.key)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((col) => (
                            <SelectItem key={col.header} value={col.header}>
                              {col.header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Optional Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionalFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Select
                        value={Object.keys(mapping).find(h => mapping[h] === field.key) || ''}
                        onValueChange={(value) => handleMappingChange(value, field.key)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {columns.map((col) => (
                            <SelectItem key={col.header} value={col.header}>
                              {col.header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview & Validate */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{copy.upload.step3.title}</CardTitle>
            <CardDescription>{copy.upload.step3.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Validation Summary */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                    <span className="font-medium text-destructive">Validation Errors Found</span>
                  </div>
                  <p className="text-sm text-destructive">
                    Please fix the errors below before proceeding.
                  </p>
                </div>
              )}

              {/* Data Preview */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(mapping).map((header) => (
                        <th key={header} className="text-left p-2 font-medium">
                          {mapping[header]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.keys(mapping).map((header) => (
                          <td key={header} className="p-2">
                            <div className="flex items-center">
                              <span className={validationErrors[`row_${index}`] ? 'text-destructive' : ''}>
                                {row[header]}
                              </span>
                              {validationErrors[`row_${index}`] && (
                                <AlertCircle className="h-4 w-4 text-destructive ml-2" />
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 10 rows of {csvData.length} total rows
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
              {copy.upload.step4.title}
            </CardTitle>
            <CardDescription>{copy.upload.step4.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Ready to import!</p>
              <p className="text-muted-foreground mb-6">
                {csvData.length} invoices will be imported and analyzed.
              </p>
              <Button onClick={handleSubmit} disabled={importMutation.isPending}>
                {importMutation.isPending ? 'Importing...' : 'Import Invoices'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < 4 && (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
