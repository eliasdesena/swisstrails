import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-trail-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm text-center">
        <Link href="/" className="inline-block mb-8">
          <Logo
            iconClassName="text-alpine-500"
            wordmarkClassName="text-fg"
            className="justify-center"
          />
        </Link>

        <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-6 mx-auto">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </div>
        <h1 className="t-h2 text-fg mb-3">No worries</h1>
        <p className="t-body text-fg-muted mb-8">
          You didn&apos;t complete the purchase. Your best Swiss summer is still
          waiting whenever you&apos;re ready.
        </p>

        <div className="space-y-3">
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href="/checkout">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Link>
          </Button>
          <Button asChild variant="ghost" size="md" className="w-full">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to website
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
