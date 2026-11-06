import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { full_name, phone, zip_code, address, city, province } = body;

  // Validasi di server
  if (!full_name || !address || !city || !province) {
    return NextResponse.json(
      { error: "Field wajib tidak lengkap" },
      { status: 400 },
    );
  }

  const supabase = createClient();

  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    full_name,
    phone,
    zip_code,
    address,
    city,
    province,
    is_default: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
