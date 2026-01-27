"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={jaJP}>
      {children}
    </ClerkProvider>
  );
}
