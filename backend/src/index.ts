import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./server";
import authRouter from "./authRouter";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import http from "http";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

dotenv.config();

// Firebase Admin 초기화
const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (fs.existsSync(keyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log("Firebase Admin initialized");
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
} else {
  console.warn("serviceAccountKey.json 없음 — Firebase Admin 토큰 검증 불가");
}

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api", userRouter);

import('./PostgreSQL').then(({ default: pool }) => {
  pool.query('SELECT 1')
    .then(() => console.log("PostgreSQL connected"))
    .catch(err => console.error("PostgreSQL connection error:", err));
});

server.listen(4000, "0.0.0.0", () => {
  console.log("Server listening on 4000");
});
