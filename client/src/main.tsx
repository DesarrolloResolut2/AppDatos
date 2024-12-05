import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Landing } from "./pages/Landing";
import { TasasPage } from "./pages/TasasPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/tasas" component={TasasPage} />
      <Route>404 - Página no encontrada</Route>
    </Switch>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
