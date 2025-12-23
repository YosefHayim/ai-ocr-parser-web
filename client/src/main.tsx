import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
const queryClient = new QueryClient();
createRoot(root!).render(
  <BrowserRouter basename="/ai-ocr-parser-web">
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>,
);
