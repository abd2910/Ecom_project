import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import router from "./routes/user.routes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // match your frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use("/api/users", router);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export { app };
