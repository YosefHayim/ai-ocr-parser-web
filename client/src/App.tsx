import "@/App.css";

import AppRoutes from "./routes/routes";
import { ProgressBarDataContext } from "./Contexts/ProgressBarData";
import { ProgressBarDataProps } from "./pages/Homepage/Homepage";
import { SocketContext } from "./Contexts/Socket";
import { envPaths } from "./envPaths";
import { io } from "socket.io-client";
import { useState } from "react";

const socket = io(envPaths.NODE_ENV === "development" ? envPaths.LOCAL_URL : envPaths.DEPLOYED_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

const App = () => {
  socket.on("connect", () => {});

  socket.on("connect_error", (err) => {
    console.error("\nSocket connection failed:", err.message);
  });

  const [progressBar, setProgressBar] = useState<ProgressBarDataProps>({ currentPage: null, totalPages: null, percent: null });
  return (
    <div className="w-full">
      <SocketContext.Provider value={socket}>
        <ProgressBarDataContext.Provider value={[progressBar, setProgressBar]}>
          <AppRoutes />
        </ProgressBarDataContext.Provider>
      </SocketContext.Provider>
    </div>
  );
};

export default App;
