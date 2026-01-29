import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type WorkLogWithCategory = Database["public"]["Tables"]["work_logs"]["Row"] & {
  categories: {
    id: string;
    name: string;
  } | null;
};

function formatDurationForCSV(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDateForCSV(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTimeForCSV(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCSVField(field: string | null | undefined): string {
  if (field === null || field === undefined) return "";
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(data: WorkLogWithCategory[]): string {
  const headers = ["日付", "カテゴリ", "作業時間", "作業時間（秒）", "メモ", "開始時刻", "作成日時"];
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const startedAtStr = row.started_at
      ? formatDateTimeForCSV(row.started_at)
      : formatDateForCSV(row.created_at);

    const csvRow = [
      escapeCSVField(formatDateForCSV(row.created_at)),
      escapeCSVField(row.categories?.name || "未分類"),
      escapeCSVField(formatDurationForCSV(row.duration)),
      escapeCSVField(String(row.duration)),
      escapeCSVField(row.memo),
      escapeCSVField(startedAtStr),
      escapeCSVField(formatDateTimeForCSV(row.created_at)),
    ];
    csvRows.push(csvRow.join(","));
  }

  return csvRows.join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");

    let query = supabase
      .from("work_logs")
      .select(`*, categories(id, name)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte("created_at", start.toISOString());
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte("created_at", end.toISOString());
    }

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }

    const csv = generateCSV(data as WorkLogWithCategory[]);

    const today = new Date().toISOString().split("T")[0];
    const filename = `work_logs_${today}.csv`;

    // BOM付きUTF-8でエンコード（Excelでの文字化け防止）
    const bom = "\uFEFF";
    const csvWithBom = bom + csv;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "エクスポートに失敗しました" }, { status: 500 });
  }
}
