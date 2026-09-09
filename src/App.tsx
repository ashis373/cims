import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@/components/common/theme";
import { AtsProvider } from "@/services/ats-store";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/auth/Login";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

// Lazily loaded components
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const CareersPage = lazy(() => import("@/pages/public/CareersPage"));
const Calendar = lazy(() => import("@/pages/calendar/Calendar"));
const Candidates = lazy(() => import("@/pages/candidates/Candidates"));
const CandidateDetails = lazy(() => import("@/pages/candidates/CandidateDetails"));
const Pipeline = lazy(() => import("@/pages/pipeline/Pipeline"));
const Reports = lazy(() => import("@/pages/reports/Reports"));
const CandidateFormPage = lazy(() => import("@/pages/candidates/CandidateFormPage"));

// New Pages
const AllJobs = lazy(() => import("@/pages/jobs/AllJobs"));
const CreateJob = lazy(() => import("@/pages/jobs/CreateJob"));
const Recruiters = lazy(() => import("@/pages/recruiters/Recruiters"));
const DuplicateCheck = lazy(() => import("@/pages/candidates/DuplicateCheck"));
const CandidateTimeline = lazy(() => import("@/pages/candidates/CandidateTimeline"));
const InterviewsUpcoming = lazy(() => import("@/pages/interviews/InterviewsUpcoming"));
const InterviewsFeedback = lazy(() => import("@/pages/interviews/InterviewsFeedback"));
const InterviewsHistory = lazy(() => import("@/pages/interviews/InterviewsHistory"));
const Offers = lazy(() => import("@/pages/offers/Offers"));
const JoiningTracker = lazy(() => import("@/pages/offers/JoiningTracker"));
const NoJoiners = lazy(() => import("@/pages/offers/NoJoiners"));
const Rejected = lazy(() => import("@/pages/rejection/Rejected"));
const Blacklisted = lazy(() => import("@/pages/rejection/Blacklisted"));
const ReportsPerformance = lazy(() => import("@/pages/reports/ReportsPerformance"));
const PipelineReport = lazy(() => import("@/pages/reports/PipelineReport"));
const Notifications = lazy(() => import("@/pages/notifications/Notifications"));
const UserProfile = lazy(() => import("@/pages/settings/system/UserProfile"));
const UserRoles = lazy(() => import("@/pages/settings/system/UserRoles"));
const SystemSettings = lazy(() => import("@/pages/settings/system/SystemSettings"));
const Departments = lazy(() => import("@/pages/settings/system/Departments"));
const EmailTemplates = lazy(() => import("@/pages/settings/email/EmailTemplates"));
const SendTemplate = lazy(() => import("@/pages/settings/email/SendTemplate"));
const SmtpSettings = lazy(() => import("@/pages/settings/email/SmtpSettings"));
const DeliveryLogs = lazy(() => import("@/pages/settings/email/DeliveryLogs"));
const ErrorLogs = lazy(() => import("@/pages/settings/system/ErrorLogs"));

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
          <ScrollToTop />
          <Toaster position="bottom-right" richColors closeButton />
          <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/careers/*" element={<CareersPage />} />
              <Route path="/login" element={<Login />} />
              
              {/* Private Routes */}
              <Route path="/*" element={
              <PrivateRoute>
                <AtsProvider>
                  <AppLayout>
                    <Suspense fallback={
                      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    }>
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
                      <Route path="/interviews" element={<InterviewsUpcoming />} />
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
                      <Route path="/reports" element={<Reports />} />

                      {/* Others */}
                      <Route path="/notifications/alerts" element={<Notifications />} />
                      {/* System Settings & Email (Admin/HR only) */}
                      <Route path="/email-settings/templates" element={<PrivateRoute requiredModule="email_settings"><EmailTemplates /></PrivateRoute>} />
                      <Route path="/email-settings/send" element={<PrivateRoute requiredModule="email_settings"><SendTemplate /></PrivateRoute>} />
                      <Route path="/email-settings/smtp" element={<PrivateRoute requiredModule="email_settings"><SmtpSettings /></PrivateRoute>} />
                      <Route path="/email-settings/logs" element={<PrivateRoute requiredModule="email_settings"><DeliveryLogs /></PrivateRoute>} />
                      <Route path="/system-settings/profile" element={<UserProfile />} />
                      <Route path="/system-settings/roles" element={<PrivateRoute allowedRoles={["Administrator"]}><UserRoles /></PrivateRoute>} />
                      <Route path="/system-settings/departments" element={<PrivateRoute requiredModule="system_settings"><Departments /></PrivateRoute>} />
                      <Route path="/system-settings/general" element={<PrivateRoute requiredModule="system_settings"><SystemSettings /></PrivateRoute>} />
                      <Route path="/system-settings/error-logs" element={<PrivateRoute allowedRoles={["Administrator"]}><ErrorLogs /></PrivateRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    </Suspense>
                  </AppLayout>
                </AtsProvider>
              </PrivateRoute>
            } />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
