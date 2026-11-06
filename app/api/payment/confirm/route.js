import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, paymentStatus } = await req.json();
  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      status: paymentStatus === "Paid" ? "Processing" : "Pending",
    })
    .eq("id", orderId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
