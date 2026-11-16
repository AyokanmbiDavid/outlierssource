
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export default function AdminProtectedRoute() {
  const { user, loading: authLoading } = useAuth();

  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkRole() {
      if (!user) {
        setRole(null);
        setChecking(false);
        return;
      }

      setChecking(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!active) return;

      if (error) {
        console.error("Admin role check failed:", error);
        setRole(null);
      } else {
        setRole(data.role);
      }

      setChecking(false);
    }

    if (!authLoading) checkRole();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
