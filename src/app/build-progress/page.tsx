import { createClient } from "@/lib/supabase";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

async function getScreens() {
  const supabase = createClient();
  const { data } = await supabase
    .from("screen_build_queue")
    .select("*")
    .order("phase", { ascending: true })
    .order("priority", { ascending: false })
    .order("id", { ascending: true });
  return data ?? [];
}

async function getStats() {
  const supabase = createClient();
  const { data } = await supabase
    .from("screen_build_queue")
    .select("status");

  const total = data?.length ?? 0;
  const done = data?.filter((s) => s.status === "done").length ?? 0;
  const inProgress = data?.filter((s) => s.status === "in_progress").length ?? 0;
  return { total, done, inProgress, todo: total - done - inProgress };
}

export default async function BuildProgressPage() {
  const [screens, stats] = await Promise.all([getScreens(), getStats()]);

  return <DashboardClient screens={screens} initialStats={stats} />;
}