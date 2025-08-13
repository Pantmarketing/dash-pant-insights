import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

// Suas Páginas
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AdminClients from "./pages/AdminClients";
import Login from "./pages/Login"; // Assumindo que você criou a página de login

// Seus Componentes
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

// --- O "Guarda de Segurança" para Rotas Privadas ---
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pega a sessão atual
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    // "Ouve" por mudanças no estado de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Carregando...</div>; // Ou um componente de spinner/loading mais bonito
  }

  // Se houver uma sessão (usuário logado), mostra a página.
  // Se não, redireciona para a página de login.
  return session ? <>{children}</> : <Navigate to="/login" />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* --- Rotas Públicas --- */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* --- Rotas Protegidas --- */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/clients" 
            element={
              <PrivateRoute>
                <AdminClients />
              </PrivateRoute>
            } 
          />
          
          {/* --- Rota "Não Encontrado" --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;