import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { addressId, items, totalAmount, paymentMethod, paymentStatus } =
    await req.json();
  const supabase = createClient();

  // Validasi stok sebelum buat order
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock, name")
      .eq("id", item.product_id)
      .single();

    if (!product) {
      return NextResponse.json(
        {
          error: `Produk tidak ditemukan`,
        },
        { status: 400 },
      );
    }

    if (product.stock < item.quantity) {
      return NextResponse.json(
        {
          error: `Stok ${product.name} tidak cukup. Tersisa ${product.stock} item`,
        },
        { status: 400 },
      );
    }
  }

  // Buat order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressId,
      total_amount: totalAmount,
      status: "Pending",
      payment_status: paymentStatus || "Pending",
      payment_method: paymentMethod || "cod",
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

  // Kurangi stok setiap produk
  for (const item of items) {
    await supabase.rpc("decrement_stock", {
      product_id: item.product_id,
      amount: item.quantity,
    });
  }

  return NextResponse.json({ success: true, orderId: order.id });
}
