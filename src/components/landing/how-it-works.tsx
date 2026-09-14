const steps = [
  {
    number: "01",
    title: "Connect Your Tools",
    description:
      "Link GitHub, Slack, Google Workspace, and your other tools to AirLock in minutes. One-time setup, forever control.",
    visual: (
      <div className="grid grid-cols-3 gap-3 p-4">
        {["🐙 GitHub", "💬 Slack", "🔵 Google", "📝 Notion", "🎨 Figma", "☁️ AWS"].map((t) => (
          <div key={t} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-center text-xs text-emerald-700 dark:text-emerald-400">
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    title: "Onboard Your Team",
    description:
      "Invite members one by one, in bulk via CSV, or send an email invite. Assign roles that automatically determine what they get access to.",
    visual: (
      <div className="p-4 space-y-2">
        {[
          { name: "Sarah Chen", role: "Engineer", tools: "GitHub + Slack + Notion" },
          { name: "Priya Sharma", role: "Designer", tools: "Figma + Slack + Notion" },
          { name: "James Park", role: "Marketing", tools: "Slack + Google" },
        ].map((m) => (
          <div key={m.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs">
            <div>
              <span className="font-medium">{m.name}</span>
              <span className="ml-2 text-muted-foreground">{m.role}</span>
            </div>
            <span className="text-[10px] text-primary">{m.tools}</span>
          </div>
        ))}
        <div className="flex items-center justify-center rounded-lg border border-dashed border-primary/40 py-3 text-xs text-primary/60">
          + Invite 47 more from CSV...
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Control Access at Scale",
    description:
      "Grant, revoke, or modify access for anyone at any time. Set expiry dates, revoke tool-by-tool, or offboard entire teams instantly.",
    visual: (
      <div className="p-4 space-y-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs font-medium mb-2">Bulk Action: Remove Slack Access</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">23 contractors selected</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Removing... 17/23 done</div>
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="rounded bg-emerald-500/10 text-emerald-600 px-2 py-1">✓ GitHub revoked</span>
          <span className="rounded bg-emerald-500/10 text-emerald-600 px-2 py-1">✓ Notion revoked</span>
          <span className="rounded bg-amber-500/10 text-amber-600 px-2 py-1">⟳ Slack in progress</span>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Up and running in{" "}
            <span className="text-primary">under 10 minutes</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            No lengthy setup. No IT tickets. Just connect, onboard, and control.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden lg:block" />

          <div className="space-y-16">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                  idx % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Text */}
                <div className={idx % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="text-5xl font-black text-primary/20 mb-3">{step.number}</div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Visual */}
                <div className={`rounded-xl border border-border bg-card overflow-hidden shadow-sm ${idx % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  {step.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
