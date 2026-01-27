"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function UserMenu() {
  return (
    <>
      <SignedIn>
        {/* ログイン済みユーザー向け */}
        <UserButton afterSignOutUrl="/" />
      </SignedIn>

      <SignedOut>
        {/* 未ログインユーザー向け */}
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="btn-secondary btn-sm">サインイン</button>
          </Link>
          <Link href="/sign-up">
            <button className="btn-primary btn-sm">新規登録</button>
          </Link>
        </div>
      </SignedOut>
    </>
  );
}
