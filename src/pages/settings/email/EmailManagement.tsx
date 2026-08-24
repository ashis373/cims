import { Card } from "@/components/ui/card";

export default function EmailManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your email templates, triggers, and logs here.</p>
        </div>
      </div>

      <Card className="p-12 text-center bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Under Construction</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          This page is currently under construction. Email management features will be available soon in a future update.
        </p>
      </Card>
    </div>
  );
}
