"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Upload,
  Filter,
  Download,
  ArrowUpDown,
  Search
} from "lucide-react";
import { useInvoices, useTodayRate } from "@/hooks/use-api";
import { formatCurrency, formatPercentage, formatDate, calculateDaysUntil, getDeadlineStatus } from "@/lib/utils";
import { RECOMMENDATION_COLORS, DEADLINE_STATUS } from "@/lib/constants";
import { copy } from "@/lib/i18n";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"apr" | "deadline">("apr");
  
  const { data: rateData, isLoading: rateLoading } = useTodayRate();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const selectAllInvoices = () => {
    if (invoicesData?.items) {
      setSelectedInvoices(invoicesData.items.map(inv => inv.id));
    }
  };

  const clearSelection = () => {
    setSelectedInvoices([]);
  };

  const filteredInvoices = invoicesData?.items?.filter(invoice =>
    invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === "apr") {
      return b.impliedAprPct - a.impliedAprPct;
    } else {
      return new Date(a.discountDeadline).getTime() - new Date(b.discountDeadline).getTime();
    }
  });

  const totalSavings = selectedInvoices.reduce((sum, id) => {
    const invoice = invoicesData?.items?.find(inv => inv.id === id);
    return sum + (invoice?.amount * 0.02 || 0); // 2% discount
  }, 0);

  const mockSavingsData = [
    { month: "Sep", savings: 1200 },
    { month: "Oct", savings: 1800 },
    { month: "Nov", savings: 2100 },
    { month: "Dec", savings: 1950 },
    { month: "Jan", savings: 2250 },
  ];

  const mockCashPlanData = [
    { week: "Week 1", take: 10000, hold: 5000 },
    { week: "Week 2", take: 8000, hold: 3000 },
    { week: "Week 3", take: 12000, hold: 2000 },
    { week: "Week 4", take: 6000, hold: 4000 },
  ];

  if (invoicesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{copy.dashboard.title}</h1>
          <p className="text-muted-foreground">
            Review and approve invoice discount opportunities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Benchmark */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                {copy.dashboard.benchmark.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {rateLoading ? "..." : formatPercentage(rateData?.benchmark.annualRatePct || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {copy.dashboard.benchmark.rate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {copy.dashboard.benchmark.delta}
                  </div>
                  <div className="text-sm font-medium text-emerald-600">
                    {rateData?.benchmark.deltaBpsDay && rateData.benchmark.deltaBpsDay > 0 ? '+' : ''}
                    {rateData?.benchmark.deltaBpsDay || 0} bps
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{copy.dashboard.actionQueue.title}</CardTitle>
                  <CardDescription>
                    {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} pending review
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortBy(sortBy === "apr" ? "deadline" : "apr")}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort by {sortBy === "apr" ? "APR" : "Deadline"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Upload a CSV to get started"}
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selection controls */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllInvoices}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {selectedInvoices.length} selected
                      </span>
                    </div>
                    {selectedInvoices.length > 0 && (
                      <Button>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Selected ({formatCurrency(totalSavings)})
                      </Button>
                    )}
                  </div>

                  {/* Invoice list */}
                  {sortedInvoices.map((invoice) => {
                    const daysUntil = calculateDaysUntil(invoice.discountDeadline);
                    const deadlineStatus = getDeadlineStatus(daysUntil);
                    const isSelected = selectedInvoices.includes(invoice.id);
                    
                    return (
                      <div
                        key={invoice.id}
                        className={`
                          flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors
                          ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}
                        `}
                        onClick={() => toggleInvoiceSelection(invoice.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
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
                            <span>•</span>
                            <Badge 
                              variant="outline" 
                              className={DEADLINE_STATUS[deadlineStatus]}
                            >
                              {daysUntil} days
                            </Badge>
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
                {copy.dashboard.savings.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(mockSavingsData[mockSavingsData.length - 1].savings)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {copy.dashboard.savings.thisMonth}
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSavingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Savings']} />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {copy.dashboard.cashPlan.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockCashPlanData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                    <Bar dataKey="take" stackId="a" fill="#10b981" name="Take Discount" />
                    <Bar dataKey="hold" stackId="a" fill="#6b7280" name="Hold Cash" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
