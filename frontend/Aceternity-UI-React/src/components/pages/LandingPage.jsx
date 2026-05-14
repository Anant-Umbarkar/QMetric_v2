import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart3, Target, BookOpen, Brain, FileText, Upload, PieChart } from 'lucide-react';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Bloom's Taxonomy Analysis",
      description: "Automatically classify questions across cognitive levels - from basic recall to higher-order thinking skills.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'CO-PO Mapping',
      description: 'Map questions to Course Outcomes and Program Outcomes for complete OBE compliance documentation.',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Module Coverage',
      description: 'Analyze syllabus coverage to ensure balanced distribution across all curriculum modules.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Visual Reports',
      description: 'Generate comprehensive reports with charts and insights for academic documentation.',
    },
  ];

  const benefits = [
    {
      title: 'OBE Compliance Made Simple',
      description: 'Automatically generate CO-PO attainment matrices required for accreditation bodies like NBA and NAAC.',
    },
    {
      title: 'Save Hours of Manual Work',
      description: 'What takes hours of manual mapping can be done in minutes with systematic rule-based analysis.',
    },
    {
      title: 'Consistent Quality Standards',
      description: 'Ensure every question paper meets institutional quality benchmarks with objective evaluation.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Paper',
      description: 'Upload question papers in PDF, image, or spreadsheet format.',
      icon: <Upload className="w-5 h-5" />,
    },
    {
      number: '02',
      title: 'Automatic Analysis',
      description: 'Our system analyzes each question for cognitive level, CO mapping, and module coverage.',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      number: '03',
      title: 'Get Detailed Reports',
      description: 'Download comprehensive reports with visualizations and improvement suggestions.',
      icon: <PieChart className="w-5 h-5" />,
    },
  ];

  // Check user authentication status
  const checkUserAuth = () => {
    const token = sessionStorage.getItem('accessToken');
    const userData = sessionStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        return parsedUser;
      } catch {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        setUser(null);
        return null;
      }
    } else {
      setUser(null);
      return null;
    }
  };

  useEffect(() => { checkUserAuth(); }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'user') checkUserAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', checkUserAuth);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', checkUserAuth);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = sessionStorage.getItem('accessToken');
      if ((!currentToken && user) || (currentToken && !user)) checkUserAuth();
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAnalyzeClick = () => {
    const currentUser = checkUserAuth();
    if (!currentUser) {
      alert('Please sign in to analyze question papers');
      return;
    }
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              Version 2.0 with CO-PO Mapping
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight tracking-tight mb-6 text-balance">
              Question paper analysis for{' '}
              <span className="text-primary">outcome-based education</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl text-pretty">
              Analyze exam papers for Bloom&apos;s Taxonomy alignment, Course Outcome mapping, 
              and module coverage. Built for engineering educators who need OBE compliance documentation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAnalyzeClick}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-medium transition-all ${
                  user
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-primary/10 text-primary cursor-not-allowed'
                }`}
              >
                {user ? 'Analyze Question Paper' : 'Sign in to get started'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-medium border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-3xl font-semibold text-foreground">100%</p>
                <p className="text-sm text-muted-foreground mt-1">OBE Compliant</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">6</p>
                <p className="text-sm text-muted-foreground mt-1">Bloom&apos;s Levels</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">CO-PO</p>
                <p className="text-sm text-muted-foreground mt-1">Matrix Generation</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">PDF</p>
                <p className="text-sm text-muted-foreground mt-1">Report Export</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
              Everything you need for question paper quality analysis
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive tools designed specifically for engineering education assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
              From upload to insights in three simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-semibold text-border">{step.number}</span>
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Why QMetric</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-6 text-balance">
                Built for educators who value quality and compliance
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                QMetric helps engineering institutions maintain consistent assessment quality 
                while meeting accreditation requirements effortlessly.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual placeholder - could be replaced with actual screenshot */}
            <div className="bg-background border border-border rounded-2xl p-8 lg:p-12">
              <div className="space-y-4">
                <div className="h-3 bg-secondary rounded-full w-3/4"></div>
                <div className="h-3 bg-secondary rounded-full w-1/2"></div>
                <div className="h-3 bg-secondary rounded-full w-5/6"></div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-xl p-4 h-24"></div>
                  <div className="bg-secondary rounded-xl p-4 h-24"></div>
                  <div className="bg-secondary rounded-xl p-4 h-24"></div>
                  <div className="bg-secondary rounded-xl p-4 h-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
            Ready to streamline your question paper analysis?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join educators who trust QMetric for systematic, OBE-compliant assessment quality analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAnalyzeClick}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-medium transition-all ${
                user
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-primary/10 text-primary cursor-not-allowed'
              }`}
            >
              {user ? 'Upload Question Paper' : 'Sign in to get started'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-medium border border-border text-foreground hover:bg-secondary transition-colors"
            >
              View sample report
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
