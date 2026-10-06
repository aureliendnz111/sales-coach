import { redirect } from "next/navigation";

// The old "Analytics" placeholder now lives at /statistics.
export default function AnalyticsPage() {
  redirect("/statistics");
}
