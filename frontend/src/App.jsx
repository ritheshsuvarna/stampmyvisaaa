import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppShell from "./components/layout/AppShell";
import { DetailSkeleton } from "./components/ui/Skeleton";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const RelocationDetail = lazy(() => import("./pages/RelocationDetail"));

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={
            <Suspense fallback={<DetailSkeleton />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="relocations/:id"
          element={
            <Suspense fallback={<DetailSkeleton />}>
              <RelocationDetail />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
