"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  History, 
  Settings,
  Calculator,
  Moon,
  Sun,
  User,
  LogOut,
  Bell,
  ChevronDown,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTodayRate } from "@/hooks/use-api";
import ChatbotDrawer from "@/components/chatbot-drawer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: rateData, isLoading: rateLoading } = useTodayRate();

  const navigationItems = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/app/invoices", icon: FileText },
    { name: "Upload", href: "/app/upload", icon: Upload },
    { name: "Audit", href: "/app/audit", icon: History },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <Calculator className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold">Invoice Optimizer</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">Demo User</div>
                <div className="text-xs text-muted-foreground truncate">demo@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Calculator className="h-5 w-5" />
              </Button>
              
              {/* Rate badge */}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1">
                  {rateLoading ? (
                    "Loading..."
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {rateData?.benchmark.annualRatePct.toFixed(1)}% 1-3M
                    </>
                  )}
                </Badge>
                {rateData?.benchmark.deltaBpsDay && (
                  <span className="text-xs text-muted-foreground">
                    {rateData.benchmark.deltaBpsDay > 0 ? '+' : ''}{rateData.benchmark.deltaBpsDay} bps
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* Chatbot */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setChatbotOpen(true)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Demo User
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Chatbot Drawer */}
      <ChatbotDrawer 
        isOpen={chatbotOpen} 
        onClose={() => setChatbotOpen(false)} 
      />
    </div>
  );
}
