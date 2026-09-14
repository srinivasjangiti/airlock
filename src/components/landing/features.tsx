import {
  Users,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3,
  GitBranch,
  Bell,
  Key,
  ShieldAlert,
  Terminal,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Bulk Onboarding & SCIM",
    description:
      "Onboard hundreds of team members at once with CSV import or direct invite. Set roles, access levels, and integrations in one step.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Zap,
    title: "Instant Access Provisioning",
    description:
      "Grant access to GitHub, Slack, AWS, and Google Workspace instantly. New members are mapped to the right tools automatically.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Clock,
    title: "Just-In-Time (JIT) Grants",
    description:
      "Set expiry dates on privileged access sessions. Break-glass emergency permissions auto-revoke when time limits expire.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: ShieldAlert,
    title: "SOC 2 & ISO 27001 Auditor",
    description:
      "Continuous compliance verification across CC6.1, CC6.6, and HIPAA safeguards with 1-click automated remediation.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Terminal,
    title: "Developer API & Webhooks",
    description:
      "Programmatic IAM evaluation, CI/CD tokens, Terraform provider keys, and dynamic SDK code generation for cURL, TS, and Python.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Policy Simulator Engine",
    description:
      "Real-time ALLOW/DENY decision simulator testing user roles, MFA enrollment, and IP whitelisting before production deployment.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Immutable Forensic Logs",
    description:
      "Full visibility into every access change. Tamper-evident forensic audit logs exportable directly to SIEM or CSV format.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: GitBranch,
    title: "Fine-Grained RBAC & ABAC",
    description:
      "Define granular role policies that map to SaaS integrations. Engineers get dev tools; SecOps gets audit monitors.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Everything You Need
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Access management, <br />
            <span className="text-primary">finally done right</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop juggling multiple admin panels. AirLock gives you complete control over
            who has access to what, across every tool your team uses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}
                >
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
