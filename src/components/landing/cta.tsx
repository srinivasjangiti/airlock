import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-12 text-center">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to take control of access?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Start managing your team&apos;s access to every tool in one place.
              Free for up to 10 members. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                variant="secondary"
                asChild
                className="group bg-white text-primary hover:bg-white/90"
              >
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="ghost"
                asChild
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="#">Book a Demo</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-primary-foreground/60">
              No setup fees · Cancel anytime · SOC 2 compliant
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
