import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/app-sidebar";

export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar>
        <main className="p-6">{children}</main>
      </AppSidebar>
    </SidebarProvider>
  );
};
