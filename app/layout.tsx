import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "Kingdoms - 官方網站",
  description: "Kingdoms 遊戲官方網站 - 最新公告、論壇討論、遊戲資訊",
  keywords: ["Kingdoms", "遊戲", "官網", "論壇", "公告"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
