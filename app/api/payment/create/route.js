import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil data user dari Clerk untuk dapat email
  const clerkUser = await currentUser();
  const userEmail = clerkUser.emailAddresses[0].emailAddress;

  const { addressId, items, totalAmount } = await req.json();
  const supabase = createClient();

  // Simpan order dulu
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressId,
      total_amount: totalAmount,
      status: "Pending",
      payment_status: "Pending",
      payment_method: "midtrans",
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Simpan order items
  await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    })),
  );

  // Hitung subtotal dari items
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Gross amount = subtotal + pajak
  const grossAmount = itemsSubtotal;

  // Item details untuk Midtrans
  const itemDetails = items.map((item) => ({
    id: item.product_id,
    price: item.price,
    quantity: item.quantity,
    name: `Produk ${item.product_id.substring(0, 8)}`,
  }));

  // Buat transaksi ke Midtrans
  const midtransRes = await fetch(
    "https://app.sandbox.midtrans.com/snap/v1/transactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: order.id,
          gross_amount: grossAmount,
        },
        item_details: itemDetails,
        customer_details: {
          email: userEmail, // email asli dari Clerk
          first_name: clerkUser.firstName || "Customer",
          last_name: clerkUser.lastName || "",
        },
      }),
    },
  );

  const midtransData = await midtransRes.json();
  console.log("Midtrans response:", JSON.stringify(midtransData, null, 2));

  if (!midtransData.token) {
    return NextResponse.json(
      {
        error: "Gagal buat transaksi Midtrans",
        detail: midtransData.error_messages,
      },
      { status: 500 },
    );
  }

  // Simpan payment token
  await supabase
    .from("orders")
    .update({ payment_token: midtransData.token })
    .eq("id", order.id);

  return NextResponse.json({
    token: midtransData.token,
    orderId: order.id,
  });
}
