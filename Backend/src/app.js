import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Routes
import Authrouter from "./routes/authRoute.js";
import appconfig from "./config/appConfig.js";

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: appconfig.REACT_APP_BASE_URL,    
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// API Routes
app.use("/api/v1/hms/auth", Authrouter);
