import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import OfflineBanner from "./OfflineBanner";
import Toaster from "../ui/Toaster";
import ConfirmDialog from "../ui/ConfirmDialog";
import AddRelocationModal from "../modals/AddRelocationModal";
import ErrorBoundary from "../ui/ErrorBoundary";

export default function AppShell() {
  const location = useLocation();
  const isDetailRoute = location.pathname.startsWith("/relocations/");
  // Master-detail pattern on mobile: show the list OR the detail, never both.
  const mainVisibility = isDetailRoute ? "flex" : "hidden md:flex";

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-bg">
      <OfflineBanner />
      <div className="flex flex-1 min-h-0">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <main className={`flex-1 flex-col min-w-0 overflow-y-auto ${mainVisibility}`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <Toaster />
      <ConfirmDialog />
      <AddRelocationModal />
    </div>
  );
}
