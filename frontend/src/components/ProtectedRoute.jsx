import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0b0b] text-white">
        <div className="space-y-4 text-center">
          <span className="text-[10px] tracking-[0.8em] uppercase text-white/40 block animate-pulse">
            Authenticating Protocol
          </span>
          <div className="w-24 h-px bg-white/20 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
