"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useImportInvoices } from "@/hooks/use-api";
import { useRouter } from "next/navigation";

/**
 * Props for ManualInvoiceForm component
 */
interface ManualInvoiceFormProps {
  onSuccess?: () => void; // Callback function called after successful submission
}

/**
 * Interface representing a single invoice entry in the form
 * All fields are strings for form handling, will be converted to appropriate types on submission
 */
interface InvoiceData {
  vendor: string;
  invoiceNumber: string;
  amount: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  notes?: string;
  userRate: string; // User's investment or borrowing rate
  rateType: 'INVESTMENT' | 'BORROWING'; // Type of rate being used
}

/**
 * Manual Invoice Form Component
 * 
 * Allows users to manually enter invoice data instead of uploading CSV files.
 * Features:
 * - Dynamic invoice list (add/remove invoices)
 * - Rate configuration (investment vs borrowing)
 * - Form validation
 * - CSV generation for backend processing
 * 
 * The form converts manual entries to CSV format internally to reuse
 * the existing import API endpoint.
 */
export default function ManualInvoiceForm({ onSuccess }: ManualInvoiceFormProps) {
  // Initialize with one empty invoice entry
  const [invoices, setInvoices] = useState<InvoiceData[]>([
    {
      vendor: "",
      invoiceNumber: "",
      amount: "",
      invoiceDate: "",
      dueDate: "",
      terms: "",
      notes: "",
      userRate: "5.0", // Default rate
      rateType: "INVESTMENT" // Default rate type
    }
  ]);

  const importMutation = useImportInvoices();
  const router = useRouter();

  const addInvoice = () => {
    setInvoices([...invoices, {
      vendor: "",
      invoiceNumber: "",
      amount: "",
      invoiceDate: "",
      dueDate: "",
      terms: "",
      notes: "",
      userRate: "5.0",
      rateType: "INVESTMENT"
    }]);
  };

  const removeInvoice = (index: number) => {
    if (invoices.length > 1) {
      setInvoices(invoices.filter((_, i) => i !== index));
    }
  };

  const updateInvoice = (index: number, field: keyof InvoiceData, value: string) => {
    const updated = [...invoices];
    updated[index] = { ...updated[index], [field]: value };
    setInvoices(updated);
  };

  const handleSubmit = async () => {
    try {
      // Convert to CSV format and submit
      const csvData = invoices.map(invoice => ({
        vendor: invoice.vendor,
        invoice_number: invoice.invoiceNumber,
        amount: invoice.amount,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        terms: invoice.terms,
        notes: invoice.notes || "",
        user_rate: invoice.userRate,
        rate_type: invoice.rateType
      }));

      // Create a CSV string
      const headers = ["vendor", "invoice_number", "amount", "invoice_date", "due_date", "terms", "notes", "user_rate", "rate_type"];
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] as string}"`).join(","))
      ].join("\n");

      // Create a blob and submit
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'manual-invoices.csv', { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      await importMutation.mutateAsync(formData);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/app/dashboard');
      }
    } catch (error) {
      console.error('Error creating invoices:', error);
    }
  };

  const isFormValid = invoices.every(invoice => 
    invoice.vendor && 
    invoice.invoiceNumber && 
    invoice.amount && 
    invoice.invoiceDate && 
    invoice.dueDate && 
    invoice.terms &&
    invoice.userRate &&
    invoice.rateType
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Invoice Entry</CardTitle>
        <CardDescription>
          Enter invoice details manually. You can add multiple invoices at once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {invoices.map((invoice, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Invoice #{index + 1}</h3>
                {invoices.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInvoice(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`vendor-${index}`}>Vendor *</Label>
                  <Input
                    id={`vendor-${index}`}
                    value={invoice.vendor}
                    onChange={(e) => updateInvoice(index, 'vendor', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`invoiceNumber-${index}`}>Invoice Number *</Label>
                  <Input
                    id={`invoiceNumber-${index}`}
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateInvoice(index, 'invoiceNumber', e.target.value)}
                    placeholder="INV-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`amount-${index}`}>Amount *</Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    step="0.01"
                    value={invoice.amount}
                    onChange={(e) => updateInvoice(index, 'amount', e.target.value)}
                    placeholder="1000.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`invoiceDate-${index}`}>Invoice Date *</Label>
                  <Input
                    id={`invoiceDate-${index}`}
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) => updateInvoice(index, 'invoiceDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`dueDate-${index}`}>Due Date *</Label>
                  <Input
                    id={`dueDate-${index}`}
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoice(index, 'dueDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`terms-${index}`}>Payment Terms *</Label>
                  <Input
                    id={`terms-${index}`}
                    value={invoice.terms}
                    onChange={(e) => updateInvoice(index, 'terms', e.target.value)}
                    placeholder="2/10 net 30"
                  />
                </div>
              </div>
              
              {/* Rate Configuration */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Rate Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate Type *</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`rateType-${index}`}
                          value="INVESTMENT"
                          checked={invoice.rateType === 'INVESTMENT'}
                          onChange={(e) => updateInvoice(index, 'rateType', e.target.value as 'INVESTMENT' | 'BORROWING')}
                          className="form-radio"
                        />
                        <span className="text-sm">Investment Rate</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`rateType-${index}`}
                          value="BORROWING"
                          checked={invoice.rateType === 'BORROWING'}
                          onChange={(e) => updateInvoice(index, 'rateType', e.target.value as 'INVESTMENT' | 'BORROWING')}
                          className="form-radio"
                        />
                        <span className="text-sm">Borrowing Rate</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      {invoice.rateType === 'INVESTMENT' 
                        ? 'Expected annual return if you hold cash instead of paying early'
                        : 'Annual interest rate if you borrow money to pay early'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`userRate-${index}`}>Annual Rate (%) *</Label>
                    <Input
                      id={`userRate-${index}`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={invoice.userRate}
                      onChange={(e) => updateInvoice(index, 'userRate', e.target.value)}
                      placeholder="5.0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                <Input
                  id={`notes-${index}`}
                  value={invoice.notes}
                  onChange={(e) => updateInvoice(index, 'notes', e.target.value)}
                  placeholder="Additional information..."
                />
              </div>
            </div>
          ))}
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={addInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Invoice
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid || importMutation.isPending}
              className="flex-1"
            >
              {importMutation.isPending ? 'Creating...' : `Create ${invoices.length} Invoice${invoices.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
