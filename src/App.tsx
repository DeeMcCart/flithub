import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Providers from "./pages/Providers";
import StartHere from "./pages/StartHere";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddResource from "./pages/admin/AddResource";
import PendingReview from "./pages/admin/PendingReview";
import ApprovedResources from "./pages/admin/ApprovedResources";
import RejectedResources from "./pages/admin/RejectedResources";
import EditResource from "./pages/admin/EditResource";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminResources from "./pages/admin/AdminResources";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/start-here" element={<StartHere />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-resource" element={<AddResource />} />
            <Route path="/admin/pending" element={<PendingReview />} />
            <Route path="/admin/approved" element={<ApprovedResources />} />
            <Route path="/admin/rejected" element={<RejectedResources />} />
            <Route path="/admin/resources/:id/edit" element={<EditResource />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/resources" element={<AdminResources />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
