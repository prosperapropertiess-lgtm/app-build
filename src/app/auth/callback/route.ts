import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      const role = user.user_metadata?.role;

      if (role === "landlord") {
        await supabase.from("landlords").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name,
        }, { onConflict: "id" });
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      // Check which role they are
      const { data: landlord } = await supabase.from("landlords").select("id").eq("id", user.id).single();
      return NextResponse.redirect(`${origin}${landlord ? "/dashboard" : "/tenant/dashboard"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
