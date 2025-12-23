import { Server } from "socket.io";
import aiRouter from "./routes/AiRoute";
import cors from "cors";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import express from "express";
import imageMagickRouter from "./routes/imageMagick";
import morgan from "morgan";
import pdfRouter from "./routes/pdfRoute";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const server = createServer(app);
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.DEPLOYED_URL : process.env.LOCAL_URL,
    credentials: true,
  })
);

export const io = new Server(server, {
  cors: {
    origin: [process.env.NODE_ENV === "production" ? process.env.DEPLOYED_URL : process.env.LOCAL_URL, "https://yosefhayim.github.io"],
  },
});
app.use(express.json());
app.use(morgan("short"));

app.get("/", (req, res) => {
  res.send("Mom tool server is running ");
});

io.on("connection", (socket) => {
  console.log("Client origin:", socket.handshake.headers.origin);
});

app.use("/api/pdf", pdfRouter);
app.use("/api/ai", aiRouter);
app.use("/api/imagemagick", imageMagickRouter);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`\nServer is running on port: ${PORT}`);
});
