"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
          <p className="mt-2 text-gray-600">
            アカウントを作成して作業時間を記録しましょう
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp />
        </div>

        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/sign-in" className="text-blue-700 hover:underline">
            サインイン
          </Link>
        </p>
      </div>
    </div>
  );
}
