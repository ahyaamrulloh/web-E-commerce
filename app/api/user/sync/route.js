import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  // Ambil userId dari session Clerk di server
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil detail user dari Clerk
  const clerkUser = await currentUser();

  // Pakai service_role untuk insert ke Supabase
  const supabase = createClient();

  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
    },
    { onConflict: "id" },
  ); // kalau id sudah ada, update saja

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
