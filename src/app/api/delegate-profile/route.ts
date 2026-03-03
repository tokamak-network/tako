import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json(null);
  }

  const { data, error } = await supabase
    .from("delegate_profiles")
    .select("*")
    .eq("address", address.toLowerCase())
    .single();

  if (error) {
    return NextResponse.json(null);
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { address, ...profile } = body;

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("delegate_profiles")
    .upsert({ address: address.toLowerCase(), ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
