import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { AtsProvider } from "@/lib/ats-store";
import { AppLayout } from "@/components/ats/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Candidates from "@/pages/Candidates";
import CandidateDetails from "@/pages/CandidateDetails";
import Pipeline from "@/pages/Pipeline";
import Reports from "@/pages/Reports";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AtsProvider>
          <BrowserRouter basename="/cims">
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/candidates/:id" element={<CandidateDetails />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AtsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
