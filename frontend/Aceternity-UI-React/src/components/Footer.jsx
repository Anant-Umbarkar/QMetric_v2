import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  
  const footerLinks = {
    features: [
      { label: "Bloom's Analysis", href: '#features' },
      { label: 'CO-PO Mapping', href: '#features' },
      { label: 'Module Coverage', href: '#features' },
      { label: 'Report Generation', href: '#features' },
    ],
    support: [
      { label: 'Documentation', href: '#' },
      { label: 'User Guide', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
    company: [
      { label: 'About', href: '#about' },
      { label: 'Credits', path: '/credits' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">Q</span>
              </div>
              <span className="text-lg font-semibold text-foreground">QMetric</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Systematic question paper quality analysis for engineering education and OBE compliance.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-foreground font-medium mb-4 text-sm">Features</h4>
            <div className="space-y-2.5">
              {footerLinks.features.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-foreground font-medium mb-4 text-sm">Support</h4>
            <div className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-foreground font-medium mb-4 text-sm">Company</h4>
            <div className="space-y-2.5">
              {footerLinks.company.map((link) => (
                link.path ? (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.path)}
                    className="block text-muted-foreground text-sm hover:text-foreground transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span>2025 QMetric. All rights reserved.</span>
          <span>Built by the QMetric Team</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
