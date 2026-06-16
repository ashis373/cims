import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@/components/common/theme";
import { AtsProvider } from "@/services/ats-store";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import Calendar from "@/pages/calendar/Calendar";
import Candidates from "@/pages/candidates/Candidates";
import CandidateDetails from "@/pages/candidates/CandidateDetails";
import Pipeline from "@/pages/pipeline/Pipeline";
import Reports from "@/pages/reports/Reports";
import CandidateFormPage from "@/pages/candidates/CandidateFormPage";

// New Pages
import DuplicateCheck from "@/pages/candidates/DuplicateCheck";
import CandidateTimeline from "@/pages/candidates/CandidateTimeline";
import InterviewsUpcoming from "@/pages/interviews/InterviewsUpcoming";
import InterviewsFeedback from "@/pages/interviews/InterviewsFeedback";
import InterviewsHistory from "@/pages/interviews/InterviewsHistory";
import OffersReleased from "@/pages/offers/OffersReleased";
import OffersAccepted from "@/pages/offers/OffersAccepted";
import OffersDeclined from "@/pages/offers/OffersDeclined";
import OffersNoJoin from "@/pages/offers/OffersNoJoin";
import RejectionsRejected from "@/pages/rejection/RejectionsRejected";
import RejectionsBlacklisted from "@/pages/rejection/RejectionsBlacklisted";
import RejectionsReasons from "@/pages/rejection/RejectionsReasons";
import ReportsCandidate from "@/pages/reports/ReportsCandidate";
import ReportsHiring from "@/pages/reports/ReportsHiring";
import ReportsRejection from "@/pages/reports/ReportsRejection";
import Notifications from "@/pages/notifications/Notifications";
import SettingsUsers from "@/pages/settings/SettingsUsers";
import SettingsRoles from "@/pages/settings/SettingsRoles";
import SettingsMasters from "@/pages/settings/SettingsMasters";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
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
          <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/cims' : '/'}>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/reports" element={<Reports />} />

                {/* Candidates */}
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/candidates/add" element={<CandidateFormPage />} />
                <Route path="/candidates/new" element={<CandidateFormPage />} />
                <Route path="/candidates/duplicate-check" element={<DuplicateCheck />} />
                <Route path="/candidates/timeline" element={<CandidateTimeline />} />
                <Route path="/candidates/:id" element={<CandidateDetails />} />
                <Route path="/candidates/:id/edit" element={<CandidateFormPage />} />

                {/* Interviews */}
                <Route path="/interviews/upcoming" element={<InterviewsUpcoming />} />
                <Route path="/interviews/feedback-pending" element={<InterviewsFeedback />} />
                <Route path="/interviews/history" element={<InterviewsHistory />} />

                {/* Offers */}
                <Route path="/offers/released" element={<OffersReleased />} />
                <Route path="/offers/accepted" element={<OffersAccepted />} />
                <Route path="/offers/declined" element={<OffersDeclined />} />
                <Route path="/offers/no-join" element={<OffersNoJoin />} />

                {/* Rejections & Blacklist */}
                <Route path="/rejections/rejected" element={<RejectionsRejected />} />
                <Route path="/rejections/blacklisted" element={<RejectionsBlacklisted />} />
                <Route path="/rejections/reasons" element={<RejectionsReasons />} />

                {/* Reports */}
                <Route path="/reports/candidate" element={<ReportsCandidate />} />
                <Route path="/reports/hiring" element={<ReportsHiring />} />
                <Route path="/reports/rejection" element={<ReportsRejection />} />

                {/* Others */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings/users" element={<SettingsUsers />} />
                <Route path="/settings/roles" element={<SettingsRoles />} />
                <Route path="/settings/masters" element={<SettingsMasters />} />

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
