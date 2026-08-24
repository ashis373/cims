import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.PROD 
  ? "https://demo.hexalearn.com/cimss/api" 
  : "http://localhost/full-cims/api";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredModule?: string;
}

export function PrivateRoute({ children, allowedRoles, requiredModule }: PrivateRouteProps) {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const headers: Record<string, string> = {};
        const userStr = localStorage.getItem("cims_user");
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.id) headers["X-User-Id"] = u.id.toString();
          } catch(e) {}
        }

        const res = await fetch(`${API_BASE_URL}/auth/me.php`, { 
          credentials: 'include', 
          cache: 'no-store',
          headers
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            localStorage.setItem("cims_user", JSON.stringify(data.data));
            localStorage.setItem("cims_login_time", Date.now().toString());
            setUserRole(data.data.role_name);
            setIsAuthenticated(true);
            
            // Check module permissions
            if (data.data.role_name === 'Administrator') {
              setIsAuthorized(true);
            } else if (requiredModule && data.data.permissions) {
              const p = data.data.permissions.find((p: any) => p.module_name === requiredModule);
              setIsAuthorized(p ? (p.can_view === 1 || p.can_view === "1" || p.can_view === true) : false);
            } else if (allowedRoles && !allowedRoles.includes(data.data.role_name)) {
              setIsAuthorized(false);
            } else {
              setIsAuthorized(true);
            }
          } else {
            throw new Error("Invalid session");
          }
        } else {
          throw new Error("Unauthorized");
        }
      } catch (err) {
        localStorage.removeItem("cims_user");
        localStorage.removeItem("cims_login_time");
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [location.pathname]);

  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1447E6]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-8">
        <ShieldAlert className="h-20 w-20 text-rose-500 mb-6 opacity-80" />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">403 Access Denied</h1>
        <p className="text-slate-500 max-w-md text-center">
          You do not have the required permissions to view this page. If you believe this is an error, please contact your System Administrator.
        </p>
        <Button 
          onClick={() => window.history.back()}
          className="mt-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-11 font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
