import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:4173", 
      "https://metavystic-task-frontend.vercel.app"]
  })
)

app.use("/health", healthRouter);
app.use("/users", usersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});