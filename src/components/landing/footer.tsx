import Link from "next/link";
import { Shield, Github, Linkedin, Youtube, Mail, Phone, ExternalLink, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  { name: "GitHub", url: "https://github.com/srinivasjangiti", icon: Github },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/srinivasajan/", icon: Linkedin },
  { name: "X (Twitter)", url: "https://x.com/sriwanders", icon: ExternalLink },
  { name: "Substack", url: "https://substack.com/@sriwanders", icon: ExternalLink },
  { name: "Medium", url: "https://medium.com/@sriwanders", icon: ExternalLink },
  { name: "YouTube", url: "https://www.youtube.com/@srinivasjan", icon: Youtube },
  { name: "LeetCode", url: "https://leetcode.com/u/srinivasaj/", icon: Code2 },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-7xl">
        {/* Creator Showcase Banner */}
        <div className="mb-14 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Lead Architect & Creator
                </span>
                <span className="text-xs text-muted-foreground">• Open-Source Project</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Srinivas Jangiti</h3>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Building mission-critical enterprise IAM solutions, zero-trust access control architectures, and high-performance developer systems. Connect with me across platforms:
              </p>
            </div>

            {/* Social Badges Grid */}
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/40 transition-colors shadow-xs"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span>{s.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <a
              href="mailto:srinivasajan.work@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>srinivasajan.work@gmail.com</span>
            </a>
            <a
              href="tel:+918767505121"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>+91 8767505121</span>
            </a>
          </div>
        </div>

        {/* Standard Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-extrabold tracking-tight">AirLock</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Identity Access Management (IAM) for modern, fast-moving teams. Control who gets in,
              what tools they can access, and manage access with automated JIT grants.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} AirLock. Created & Maintained by{" "}
              <a
                href="https://github.com/srinivasjangiti"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline hover:text-foreground"
              >
                Srinivas Jangiti
              </a>
              . Licensed under MIT.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Live Dashboard</Link></li>
              <li><Link href="/members" className="hover:text-foreground transition-colors">Directory</Link></li>
              <li><Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link href="/access" className="hover:text-foreground transition-colors">Policy Engine</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Security</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground">Zero Trust Model</span></li>
              <li><span className="hover:text-foreground">Just-In-Time Grants</span></li>
              <li><span className="hover:text-foreground">SOC 2 Alignment</span></li>
              <li><span className="hover:text-foreground">Immutable Audit Trail</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Developer</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://github.com/srinivasjangiti" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub Profile</a></li>
              <li><a href="https://x.com/sriwanders" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">X / Updates</a></li>
              <li><a href="https://substack.com/@sriwanders" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Substack Engineering</a></li>
              <li><a href="https://medium.com/@sriwanders" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Medium Articles</a></li>
            </ul>
          </div>
        </div>

        <Separator />
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Built with Next.js 16, React 19, Tailwind CSS v4 & Radix UI.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All IAM engines operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
