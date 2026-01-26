/**
 * Supabase クライアント設定
 *
 * Clerk認証との連携（カスタムヘッダー方式）
 * - サーバーサイドでClerkのユーザーIDをヘッダーに付与
 * - RLSポリシーでget_clerk_user_id()関数を使用してアクセス制御
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// 環境変数
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 基本のSupabaseクライアント（RLS適用）
 * クライアントサイドでの使用は非推奨
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * 管理者用Supabaseクライアント（RLSバイパス）
 * サーバーサイドでのみ使用可能
 * 注意: このクライアントはRLSを完全にバイパスするため、
 *       必ずサーバーサイドでのみ使用し、ユーザーIDの検証を行うこと
 */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * 認証済みSupabaseクライアントを作成（サーバーサイド用）
 *
 * @param userId - ClerkのユーザーID
 * @returns Supabaseクライアント（カスタムヘッダー付き）
 *
 * @example
 * ```ts
 * import { auth } from '@clerk/nextjs/server'
 * import { createAuthenticatedClient } from '@/lib/supabase'
 *
 * export async function GET() {
 *   const { userId } = await auth()
 *   if (!userId) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   }
 *
 *   const supabase = createAuthenticatedClient(userId)
 *   const { data, error } = await supabase.from('categories').select('*')
 *   // RLSにより自動的にユーザーのデータのみ取得される
 * }
 * ```
 */
export function createAuthenticatedClient(
  userId: string
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-clerk-user-id": userId,
      },
    },
  });
}

/**
 * 環境変数の検証
 * アプリケーション起動時にSupabaseの設定を確認
 */
export function validateSupabaseConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  if (!supabaseAnonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }

  // Service Role Keyは必須ではないが、警告を出す
  if (!supabaseServiceRoleKey) {
    console.warn(
      "Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not be available."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
