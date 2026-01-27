"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">サインイン</h1>
          <p className="mt-2 text-gray-600">Project Trackerへようこそ</p>
        </div>

        <div className="flex justify-center">
          <SignIn />
        </div>

        <p className="text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{" "}
          <Link href="/sign-up" className="text-blue-700 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
