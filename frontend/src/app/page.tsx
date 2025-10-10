import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  TrendingUp, 
  DollarSign, 
  History, 
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Calculator,
  Shield,
  Zap
} from "lucide-react";
import { FEATURES, HOW_IT_WORKS, EXAMPLE_CALCULATION } from "@/lib/constants";
import { copy } from "@/lib/i18n";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Invoice Optimizer</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {copy.hero.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {copy.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/demo">
                {copy.hero.cta.tryDemo}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-up">{copy.hero.cta.signUp}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Example Calculation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Example: {EXAMPLE_CALCULATION.terms} on ${EXAMPLE_CALCULATION.amount.toLocaleString()}</CardTitle>
              <CardDescription className="text-center">
                Three-scenario analysis showing the best financial decision for your situation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                  <div className="text-2xl font-bold text-emerald-600 mb-2">${EXAMPLE_CALCULATION.scenarios.payEarly}</div>
                  <div className="text-sm font-medium text-emerald-800 mb-1">Pay Early</div>
                  <div className="text-xs text-emerald-600">Use your own cash</div>
                </div>
                <div className="text-center p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600 mb-2">${EXAMPLE_CALCULATION.scenarios.holdCash}</div>
                  <div className="text-sm font-medium text-blue-800 mb-1">Hold Cash</div>
                  <div className="text-xs text-blue-600">Invest elsewhere</div>
                </div>
                <div className="text-center p-4 rounded-lg border border-orange-200 bg-orange-50">
                  <div className="text-2xl font-bold text-orange-600 mb-2">${EXAMPLE_CALCULATION.scenarios.borrowToPay}</div>
                  <div className="text-sm font-medium text-orange-800 mb-1">Borrow to Pay</div>
                  <div className="text-xs text-orange-600">Borrow money</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-sm text-muted-foreground">
                  Implied APR: {EXAMPLE_CALCULATION.impliedApr}% | Your Rate: {EXAMPLE_CALCULATION.benchmark}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to optimize your cash flow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <Card key={step.step} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to make smart invoice decisions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon === "Upload" ? Upload :
                          feature.icon === "TrendingUp" ? TrendingUp :
                          feature.icon === "DollarSign" ? DollarSign :
                          feature.icon === "History" ? History :
                          feature.icon === "Calculator" ? Calculator :
                          feature.icon === "Shield" ? Shield : Upload;
              
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground">Advanced financial analysis with complete user control</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Three-Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compare Pay Early, Hold Cash, and Borrow to Pay Early options with precise calculations.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Custom Rate Input</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Input your own investment or borrowing rates for personalized recommendations.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track potential savings, cash flow, and ROI with interactive charts and reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Secure JWT authentication with complete data isolation. No bank logins required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              JWT Authentication
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Data Isolation
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Secure Processing
            </Badge>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <Zap className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Make Smart Financial Decisions?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get three-scenario analysis for every invoice with your custom rates. Start optimizing your cash flow today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/demo">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="h-6 w-6 text-primary" />
                <span className="font-bold">Invoice Optimizer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Make the right call on every invoice with data-driven insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/demo" className="text-muted-foreground hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="#contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><Link href="#privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link href="#docs" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="#status" className="text-muted-foreground hover:text-foreground">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Invoice Optimizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
