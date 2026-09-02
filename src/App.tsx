import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./services/Guard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import GroupFormPage from "./pages/GroupFormPage";
import TestsPage from "./pages/TestsPage";
import TestDetailPage from "./pages/TestDetailPage";
import TestFormPage from "./pages/TestFormPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<AdminRoute element={<RegisterPage />} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
          <Route path="/groups" element={<ProtectedRoute element={<GroupsPage />} />} />
          <Route path="/groups/new" element={<AdminRoute element={<GroupFormPage />} />} />
          <Route path="/groups/:id" element={<ProtectedRoute element={<GroupDetailPage />} />} />
          <Route path="/groups/:id/edit" element={<AdminRoute element={<GroupFormPage />} />} />
          <Route path="/tests" element={<AdminRoute element={<TestsPage />} />} />
          <Route path="/tests/new" element={<AdminRoute element={<TestFormPage />} />} />
          <Route path="/tests/:id" element={<AdminRoute element={<TestDetailPage />} />} />
          <Route path="/tests/:id/edit" element={<AdminRoute element={<TestFormPage />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
