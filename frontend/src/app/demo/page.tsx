"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Upload,
  MessageCircle
} from "lucide-react";
import { mockInvoices, mockRate, mockSavingsData } from "@/lib/mock-data";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { RECOMMENDATION_COLORS } from "@/lib/constants";

export default function DemoPage() {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const totalSavings = selectedInvoices.reduce((sum, id) => {
    const invoice = mockInvoices.find(inv => inv.id === id);
    return sum + ((invoice?.amount || 0) * 0.02); // 2% discount
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Demo Banner */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            🎯 Demo Mode - This is sample data to show you how the app works
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Invoice Optimizer</span>
              <Badge variant="outline" className="ml-2">Demo</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Benchmark */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Today's Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatPercentage(mockRate.benchmark.annualRatePct)}</div>
                    <div className="text-sm text-muted-foreground">{mockRate.benchmark.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">vs yesterday</div>
                    <div className="text-sm font-medium text-emerald-600">
                      +{mockRate.benchmark.deltaBpsDay} bps
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Queue */}
            <Card>
              <CardHeader>
                <CardTitle>Action Queue</CardTitle>
                <CardDescription>
                  Review and approve invoice discount opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInvoices.slice(0, 3).map((invoice) => {
                    
                    return (
                      <div
                        key={invoice.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleInvoiceSelection(invoice.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleInvoiceSelection(invoice.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{invoice.vendor}</div>
                            <div className="text-lg font-bold">{formatCurrency(invoice.amount)}</div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>{invoice.terms}</span>
                            <span>•</span>
                            <span>Due {formatDate(invoice.dueDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatPercentage(invoice.impliedAprPct)}</div>
                          <Badge 
                            variant="outline" 
                            className={RECOMMENDATION_COLORS[invoice.recommendation]}
                          >
                            {invoice.recommendation}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedInvoices.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Estimated savings: {formatCurrency(totalSavings)}
                        </div>
                      </div>
                      <Button>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Selected
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Savings Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Savings Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(mockSavingsData[mockSavingsData.length - 1].savings)}
                  </div>
                  <div className="text-sm text-muted-foreground">Saved this month</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask AI Assistant
                </Button>
              </CardContent>
            </Card>

            {/* Demo Info */}
            <Card>
              <CardHeader>
                <CardTitle>About This Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    This demo shows how the app analyzes invoice discounts against today's interest rates.
                  </p>
                  <p>
                    Try selecting different invoices to see the savings calculations.
                  </p>
                  <p>
                    <strong>Ready to get started?</strong>
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/auth/sign-up">
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
