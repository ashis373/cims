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
import Login from "@/pages/auth/Login";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

// New Pages
import AllJobs from "@/pages/jobs/AllJobs";
import CreateJob from "@/pages/jobs/CreateJob";
import Recruiters from "@/pages/recruiters/Recruiters";
import DuplicateCheck from "@/pages/candidates/DuplicateCheck";
import CandidateTimeline from "@/pages/candidates/CandidateTimeline";
import InterviewsUpcoming from "@/pages/interviews/InterviewsUpcoming";
import InterviewsFeedback from "@/pages/interviews/InterviewsFeedback";
import InterviewsHistory from "@/pages/interviews/InterviewsHistory";
import Offers from "@/pages/offers/Offers";
import JoiningTracker from "@/pages/offers/JoiningTracker";
import NoJoiners from "@/pages/offers/NoJoiners";
import Rejected from "@/pages/rejection/Rejected";
import Blacklisted from "@/pages/rejection/Blacklisted";
import ReportsPerformance from "@/pages/reports/ReportsPerformance";
import Notifications from "@/pages/notifications/Notifications";
import UserProfile from "@/pages/settings/system/UserProfile";
import UserRoles from "@/pages/settings/system/UserRoles";
import SystemSettings from "@/pages/settings/system/SystemSettings";
import Departments from "@/pages/settings/system/Departments";
import EmailManagement from "@/pages/settings/email/EmailManagement";

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
        <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/cims' : '/'}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <PrivateRoute>
                <AtsProvider>
                  <AppLayout>
                    <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/pipeline" element={<Pipeline />} />
                    <Route path="/reports" element={<Reports />} />

                    {/* Jobs */}
                    <Route path="/jobs/all" element={<AllJobs />} />
                    <Route path="/jobs/create" element={<CreateJob />} />
                    <Route path="/jobs/edit/:id" element={<CreateJob />} />

                    {/* Recruiters */}
                    <Route path="/recruiters" element={<Recruiters />} />

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
                    <Route path="/offers/management" element={<Offers />} />
                    <Route path="/offers/joining-tracker" element={<JoiningTracker />} />
                    <Route path="/offers/no-joiners" element={<NoJoiners />} />
                    <Route path="/offers/:tab?" element={<Offers />} />

                    {/* Rejections & Blacklist */}
                    <Route path="/rejections/rejected" element={<Rejected />} />
                    <Route path="/rejections/blacklisted" element={<Blacklisted />} />

                    {/* Reports */}
                    <Route path="/reports/candidate" element={<Reports />} />
                    <Route path="/reports/recruiter-performance" element={<ReportsPerformance />} />
                    <Route path="/reports/hiring" element={<Reports />} />
                    <Route path="/reports/rejection-analysis" element={<ReportsPerformance />} />
                    <Route path="/reports/blacklist" element={<Blacklisted />} />
                    <Route path="/reports/no-joiners" element={<NoJoiners />} />
                    <Route path="/reports" element={<Reports />} />

                    {/* Others */}
                    <Route path="/notifications/alerts" element={<Notifications />} />
                    {/* System Settings & Email (Admin/HR only) */}
                    <Route path="/email-settings/management" element={<PrivateRoute requiredModule="Email Settings"><EmailManagement /></PrivateRoute>} />
                    <Route path="/system-settings/profile" element={<UserProfile />} />
                    <Route path="/system-settings/roles" element={<PrivateRoute allowedRoles={["Administrator"]}><UserRoles /></PrivateRoute>} />
                    <Route path="/system-settings/departments" element={<PrivateRoute requiredModule="System Settings"><Departments /></PrivateRoute>} />
                    <Route path="/system-settings/general" element={<PrivateRoute requiredModule="System Settings"><SystemSettings /></PrivateRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </AppLayout>
                </AtsProvider>
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
