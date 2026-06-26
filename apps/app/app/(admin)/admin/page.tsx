import { Map, Users, ShoppingBag, Star, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";

const STATS = [
  {
    label: "Total Locations",
    value: String(PLACEHOLDER_LOCATIONS.length),
    icon: Map,
    trend: "Seeded catalogue",
  },
  { label: "Total Users", value: "0", icon: Users, trend: "Awaiting launch" },
  { label: "Total Sales", value: "CHF 0", icon: ShoppingBag, trend: "—" },
  { label: "Avg. Rating", value: "—", icon: Star, trend: "—" },
];

const QUICK_LINKS = [
  { label: "Add Location", href: "/admin/locations/new", icon: Plus },
  { label: "Manage Locations", href: "/admin/locations", icon: Map },
  { label: "View Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-trail-950 p-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="t-h2 text-fg">Admin Dashboard</h1>
            <p className="text-fg-muted text-sm mt-1">Swiss Trails CMS</p>
          </div>
          <Link href="/" className="text-fg-subtle hover:text-fg text-sm transition-colors">
            ← View site
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="card-solid rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-4 h-4 text-fg-subtle" />
              </div>
              <p className="t-h3 text-fg">{stat.value}</p>
              <p className="text-fg-muted text-xs mt-1">{stat.label}</p>
              <p className="text-fg-subtle text-xs mt-0.5">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="card-solid rounded-xl p-5 hover:border-stone-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-trail-800 border border-stone-800 group-hover:border-stone-700 flex items-center justify-center mb-3 transition-colors">
                <link.icon className="w-4 h-4 text-fg-muted group-hover:text-fg transition-colors" />
              </div>
              <p className="text-fg text-sm font-medium">{link.label}</p>
            </Link>
          ))}
        </div>

        <p className="text-fg-subtle text-xs text-center mt-16">
          Admin panel — access restricted to role: admin
        </p>
      </div>
    </div>
  );
}
