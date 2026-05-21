import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { PlanProvider } from "@/lib/plan-context";
import { ProfileProvider } from "@/lib/profile-context";
import { UsageBanner } from "@/components/ui/UsageBanner";
import { getUserPlan, getUsageCounts, getProfile, getTrialInfo } from "@/lib/actions/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialPlan, initialUsage, profile, trialInfo] = await Promise.all([
    getUserPlan(),
    getUsageCounts(),
    getProfile(),
    getTrialInfo(),
  ]);

  return (
    <PlanProvider
      initialPlan={initialPlan}
      initialUsage={initialUsage}
      initialTrialDaysLeft={trialInfo.daysLeft}
      initialTrialClaimed={trialInfo.claimed}
    >
      <ProfileProvider initialName={profile.name} initialAvatarUrl={profile.avatarUrl}>
        <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:ml-60">
            <Header />
            <UsageBanner />
            <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
          </div>
          <BottomNav />
        </div>
      </ProfileProvider>
    </PlanProvider>
  );
}
