import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.PROD 
  ? "https://demo.hexalearn.com/cims/api" 
  : "http://localhost/full-cims/api";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me.php`, { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            localStorage.setItem("cims_user", JSON.stringify(data.data));
            localStorage.setItem("cims_login_time", Date.now().toString());
            setUserRole(data.data.role_name);
            setIsAuthenticated(true);
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

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
          <div className="text-center max-w-md space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-rose-100 flex items-center justify-center">
                <ShieldAlert className="h-12 w-12 text-rose-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Denied</h1>
              <p className="text-sm text-slate-500">
                You do not have the required permissions to view this page. If you believe this is an error, please contact your System Administrator.
              </p>
            </div>
            <Button 
              onClick={() => window.history.back()}
              className="mt-4 bg-[#1447E6] hover:bg-[#0c31a6] text-white font-bold rounded-xl h-11 px-6 shadow-md shadow-[#1447E6]/20 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
