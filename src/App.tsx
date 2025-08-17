import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import { Dashboard } from "@/components/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProjectGenerator from "./pages/admin/ProjectGenerator";
import ProjectCreation from "./pages/admin/ProjectCreation";
import ProjectSetup from "./pages/admin/ProjectSetup";
import ProjectList from "./pages/admin/ProjectList";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="advantx-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/project-generator" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects/new" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectCreation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects/:id/setup" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
