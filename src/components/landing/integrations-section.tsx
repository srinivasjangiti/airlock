const integrations = [
  {
    name: "GitHub",
    description: "Manage repos, org membership & team access",
    icon: "🐙",
    status: "available",
    users: "1.2M+",
  },
  {
    name: "Slack",
    description: "Auto-add/remove users from channels & workspaces",
    icon: "💬",
    status: "available",
    users: "950K+",
  },
  {
    name: "Google Workspace",
    description: "Gmail, Drive, Meet, Calendar, and Admin access",
    icon: "🔵",
    status: "available",
    users: "800K+",
  },
  {
    name: "Notion",
    description: "Grant & revoke workspace and page access",
    icon: "📝",
    status: "available",
    users: "340K+",
  },
  {
    name: "Jira",
    description: "Project access and board membership management",
    icon: "🔷",
    status: "coming-soon",
    users: "Coming soon",
  },
  {
    name: "Figma",
    description: "Design file and team permission management",
    icon: "🎨",
    status: "coming-soon",
    users: "Coming soon",
  },
  {
    name: "AWS",
    description: "IAM roles, S3, EC2, and console access",
    icon: "☁️",
    status: "coming-soon",
    users: "Coming soon",
  },
  {
    name: "Linear",
    description: "Issue tracking team and project access",
    icon: "📐",
    status: "coming-soon",
    users: "Coming soon",
  },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Integrations
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Connect your entire{" "}
            <span className="text-primary">tool stack</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            AirLock connects to the tools your team already uses. Add an integration once,
            manage access forever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className={`relative rounded-xl border bg-card p-5 transition-all duration-200 ${
                integration.status === "available"
                  ? "border-border hover:border-primary/40 hover:shadow-md cursor-pointer"
                  : "border-border/50 opacity-60"
              }`}
            >
              {integration.status === "coming-soon" && (
                <div className="absolute top-3 right-3 text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  Soon
                </div>
              )}
              {integration.status === "available" && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </div>
              )}
              <div className="text-3xl mb-3">{integration.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{integration.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {integration.description}
              </p>
              <p className="text-xs text-muted-foreground">{integration.users}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          And 20+ more integrations coming soon.{" "}
          <a href="#" className="text-primary hover:underline">
            Request an integration →
          </a>
        </p>
      </div>
    </section>
  );
}
