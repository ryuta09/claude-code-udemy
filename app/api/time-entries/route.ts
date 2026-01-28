import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase";

// 作業記録一覧取得
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAuthenticatedClient(userId);

    const { data, error } = await supabase
      .from("work_logs")
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch time entries" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 作業記録作成
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category_id, duration, memo, started_at } = body;

    // バリデーション
    if (!category_id) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be a positive number" },
        { status: 400 }
      );
    }

    const supabase = createAuthenticatedClient(userId);

    const { data, error } = await supabase
      .from("work_logs")
      .insert({
        user_id: userId,
        category_id,
        duration,
        memo: memo || null,
        started_at: started_at || null,
      })
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create time entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
