import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { PlanProvider } from "@/lib/plan-context";
import { UsageBanner } from "@/components/ui/UsageBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanProvider>
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
          <Header />
          <UsageBanner />
          <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
        </div>
        <BottomNav />
      </div>
    </PlanProvider>
  );
}
