/**
 * ユーザー管理ヘルパー関数
 *
 * Clerkでサインイン後、Supabaseのusersテーブルにユーザーを登録する
 */

import { supabaseAdmin } from "./supabase";

interface EnsureUserParams {
  userId: string;
  email: string;
}

/**
 * ユーザーがSupabaseに存在することを確認し、存在しなければ作成する
 *
 * @param userId - ClerkのユーザーID
 * @param email - ユーザーのメールアドレス
 * @returns 成功した場合はtrue、失敗した場合はfalse
 */
export async function ensureUserExists({
  userId,
  email,
}: EnsureUserParams): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not configured");
    return false;
  }

  try {
    // ユーザーが既に存在するか確認
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = "No rows found" は正常（ユーザーが存在しない場合）
      console.error("Error checking user existence:", selectError);
      return false;
    }

    // ユーザーが既に存在する場合は何もしない
    if (existingUser) {
      return true;
    }

    // ユーザーを作成
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: email,
    });

    if (insertError) {
      // 重複エラーの場合は成功として扱う（並行リクエストで既に作成された場合）
      if (insertError.code === "23505") {
        return true;
      }
      console.error("Error creating user:", insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in ensureUserExists:", error);
    return false;
  }
}
