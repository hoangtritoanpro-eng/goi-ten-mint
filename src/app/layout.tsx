import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Tạo Đề Toán",
  description: "Ứng dụng tạo đề toán bằng AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* ĐÂY LÀ VŨ KHÍ TỐI THƯỢNG: Ép trình duyệt tự động tải màu sắc */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}