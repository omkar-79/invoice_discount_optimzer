"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  DollarSign,
  ArrowUpDown,
  X,
  FileText
} from "lucide-react";
import { useAuditItems } from "@/hooks/use-api";
import { formatCurrency, formatPercentage, formatDateTime } from "@/lib/utils";
import { copy } from "@/lib/i18n";

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"timestamp" | "user" | "savings">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const { data: auditData, isLoading } = useAuditItems({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    user: userFilter !== "all" ? userFilter : undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
  });

  const auditItems = auditData?.items || [];

  // Enhanced filtering with search functionality
  const filteredItems = useMemo(() => {
    let filtered = [...auditItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoices.some(inv => 
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        item.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "user":
          comparison = a.user.localeCompare(b.user);
          break;
        case "savings":
          comparison = a.estimatedSavings - b.estimatedSavings;
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [auditItems, searchTerm, sortBy, sortOrder]);

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'User', 
      'Invoice IDs',
      'Action',
      'Benchmark Rate (%)',
      'Implied APR (%)',
      'Estimated Savings ($)',
      'Note'
    ];
    
    const csvData = filteredItems.map(item => [
      item.timestamp,
      item.user,
      item.invoices.map(inv => inv.invoiceNumber).join(';'),
      item.action,
      item.benchmarkPct.toFixed(2),
      item.impliedAprPct.toFixed(2),
      item.estimatedSavings.toFixed(2),
      item.note || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "APPROVE_TAKE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "APPROVE_HOLD":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "APPROVE_TAKE":
        return "✓";
      case "APPROVE_HOLD":
        return "⏸";
      default:
        return "?";
    }
  };

  const totalSavings = auditItems.reduce((sum, item) => sum + item.estimatedSavings, 0);
  const totalDecisions = auditItems.length;
  const takeDecisions = auditItems.filter(item => item.action === 'APPROVE_TAKE').length;
  const holdDecisions = auditItems.filter(item => item.action === 'APPROVE_HOLD').length;
  const avgSavingsPerDecision = totalDecisions > 0 ? totalSavings / totalDecisions : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
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
          <h1 className="text-3xl font-bold">{copy.audit.title}</h1>
          <p className="text-muted-foreground">
            Complete history of all invoice decisions and approvals
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredItems.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDecisions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Take Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{takeDecisions}</div>
            <p className="text-xs text-muted-foreground">Approved for discount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">From approved discounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgSavingsPerDecision)}
            </div>
            <p className="text-xs text-muted-foreground">Per decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="demo@example.com">demo@example.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="APPROVE_TAKE">Approve Take</SelectItem>
                  <SelectItem value="APPROVE_HOLD">Approve Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Sort by:</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Date</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredItems.length} entr{filteredItems.length !== 1 ? 'ies' : 'y'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              {auditItems.length === 0 ? (
                <>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No audit entries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by approving some invoices to see your decision history here.
                  </p>
                  <Button onClick={() => window.location.href = '/app/invoices'}>
                    Go to Invoices
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Timestamp</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Invoice(s)</th>
                    <th className="text-center p-4 font-medium">Action</th>
                    <th className="text-right p-4 font-medium">Benchmark</th>
                    <th className="text-right p-4 font-medium">APR</th>
                    <th className="text-right p-4 font-medium">Savings</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="text-sm">{formatDateTime(item.timestamp)}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.user}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {item.invoices.length} invoice{item.invoices.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.invoices.slice(0, 2).map(inv => inv.invoiceNumber).join(', ')}
                          {item.invoices.length > 2 && ` +${item.invoices.length - 2} more`}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge 
                          variant="outline" 
                          className={getActionColor(item.action)}
                        >
                          <span className="mr-1">{getActionIcon(item.action)}</span>
                          {item.action.replace('APPROVE_', '')}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-medium">
                          {formatPercentage(item.benchmarkPct)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-medium">
                          {formatPercentage(item.impliedAprPct)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-emerald-600">
                            {formatCurrency(item.estimatedSavings)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-lg">
            <CardHeader className="bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <CardTitle>Audit Entry Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="bg-white dark:bg-gray-900">
              {(() => {
                const item = auditItems.find(entry => entry.id === selectedItem);
                if (!item) return null;
                
                return (
                  <div className="space-y-6 text-gray-900 dark:text-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{formatDateTime(item.timestamp)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">User</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{item.user}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Action</label>
                        <Badge 
                          variant="outline" 
                          className={getActionColor(item.action)}
                        >
                          {getActionIcon(item.action)} {item.action.replace('APPROVE_', '')}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Savings</label>
                        <p className="text-lg font-medium text-emerald-600">
                          {formatCurrency(item.estimatedSavings)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Invoice Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Invoice Numbers:</span>
                          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{item.invoices.map(inv => inv.invoiceNumber).join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Vendors:</span>
                          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{item.invoices.map(inv => inv.vendor).join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Benchmark Rate:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatPercentage(item.benchmarkPct)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Implied APR:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatPercentage(item.impliedAprPct)}</span>
                        </div>
                      </div>
                    </div>

                    {item.note && (
                      <div className="border-t pt-6">
                        <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Notes</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded">
                          {item.note}
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Raw Data</h3>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-gray-900 dark:text-gray-100">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
