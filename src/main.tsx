import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/globals.css";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <OrganizationProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </OrganizationProvider>
    </AuthProvider>
  </StrictMode>
);