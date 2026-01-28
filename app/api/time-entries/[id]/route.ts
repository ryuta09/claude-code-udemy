import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 作業記録更新
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { category_id, duration, memo, started_at } = body;

    // バリデーション
    if (duration !== undefined && (typeof duration !== "number" || duration <= 0)) {
      return NextResponse.json(
        { error: "Duration must be a positive number" },
        { status: 400 }
      );
    }

    const supabase = createAuthenticatedClient(userId);

    const updateData: {
      category_id?: string;
      duration?: number;
      memo?: string | null;
      started_at?: string | null;
    } = {};

    if (category_id !== undefined) updateData.category_id = category_id;
    if (duration !== undefined) updateData.duration = duration;
    if (memo !== undefined) updateData.memo = memo;
    if (started_at !== undefined) updateData.started_at = started_at;

    const { data, error } = await supabase
      .from("work_logs")
      .update(updateData)
      .eq("id", id)
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
        { error: "Failed to update time entry" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Time entry not found" },
        { status: 404 }
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

// 作業記録削除
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = createAuthenticatedClient(userId);

    const { error } = await supabase.from("work_logs").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete time entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
