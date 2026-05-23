"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function cycleTaskStatus(id: number, current: string) {
  const next = current === "todo" ? "in_progress" : current === "in_progress" ? "done" : "todo";
  await supabase.from("build_tasks").update({ status: next, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/");
}
