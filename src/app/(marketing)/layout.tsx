import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AirLock — Identity Access Management for Modern Teams",
  description:
    "Onboard hundreds of users at once, manage access to GitHub, Slack, Google Workspace and more — all from one powerful dashboard.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
