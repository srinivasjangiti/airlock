import {
  Users,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3,
  GitBranch,
  Bell,
  Key,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Bulk Onboarding",
    description:
      "Onboard hundreds of team members at once with CSV import or direct invite. Set roles, access levels, and integrations in one step.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Zap,
    title: "Instant Access Provisioning",
    description:
      "Grant access to GitHub, Slack, Google Workspace, and more instantly. New members are added to the right tools automatically.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Clock,
    title: "Time-Limited Access",
    description:
      "Set expiry dates on access. Perfect for contractors, temp workers, or projects. Access revokes automatically when the time is up.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Granular Permissions",
    description:
      "Give access to specific tools, not everything. A designer needs Figma and Slack, not GitHub. Control it at the individual level.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Key,
    title: "Instant Revocation",
    description:
      "Remove access across all connected tools with a single click. Offboarding 100 people? Done in seconds.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Bell,
    title: "Access Alerts",
    description:
      "Get notified when access is expiring, granted, or revoked. Stay in complete control of who has access to what.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: BarChart3,
    title: "Audit Logs",
    description:
      "Full visibility into every access change. Know exactly who granted what access, when, and why — across your entire organization.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: GitBranch,
    title: "Role-Based Access",
    description:
      "Define roles that map to access policies. Engineers get dev tools. Ops get infrastructure. Marketing gets analytics. Consistent, every time.",
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
