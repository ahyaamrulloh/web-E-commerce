import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();

  // Ambil form data
  const formData = await req.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const category = formData.get("category");
  const price = parseInt(formData.get("price"));
  const offer_price = formData.get("offer_price")
    ? parseInt(formData.get("offer_price"))
    : null;
  const stock = parseInt(formData.get("stock")) || 0;
  const images = formData.getAll("images");

  // Upload semua gambar ke Supabase Storage
  const imageUrls = [];
  for (const image of images) {
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products") // nama bucket di Supabase Storage
      .upload(fileName, image, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Gagal upload gambar: " + uploadError.message },
        { status: 500 },
      );
    }

    // Ambil public URL gambar
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(fileName);

    imageUrls.push(publicUrl);
  }

  // Simpan produk ke database
  const { error } = await supabase.from("products").insert({
    name,
    description,
    category,
    price,
    offer_price,
    stock,
    image: imageUrls,
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
