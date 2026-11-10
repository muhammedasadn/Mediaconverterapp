import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universal Converter — Admin & Telemetry',
  description: 'Cluster health, BullMQ queue telemetry, and native worker load monitoring.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body className="bg-[#0B0D12] text-white min-h-screen antialiased p-6">
        {children}
      </body>
    </html>
  );
}
