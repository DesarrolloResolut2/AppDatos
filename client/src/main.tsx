import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Landing } from "./pages/Landing";
import { TasasPage } from "./pages/TasasPage";
import { CensoPage } from "./pages/CensoPage";
import { MunicipiosPage } from "./pages/MunicipiosPage";
import { NatalidadPage } from "./pages/NatalidadPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/tasas" component={TasasPage} />
      <Route path="/censo" component={CensoPage} />
      <Route path="/municipios" component={MunicipiosPage} />
      <Route path="/natalidad" component={NatalidadPage} />
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
