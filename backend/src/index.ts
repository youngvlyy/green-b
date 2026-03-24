import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./server";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import http from "http";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
// import {initSocket} from "./websocket";


dotenv.config();

// Firebase Admin 초기화
const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (fs.existsSync(keyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log("Firebase Admin initialized (serviceAccountKey.json)");
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log("Firebase Admin initialized (env)");
} else {
  console.warn("serviceAccountKey.json 없음 — 토큰 검증 불가. Firebase Console에서 다운로드 필요");
}

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", userRouter);
// app.use((req, res, next) => {
//   console.log("Incoming request:", req.method, req.url);
//   next();
// });

// initSocket(server);

const PORT = 4000;

if (!process.env.MONGO_URI) {
  console.error("몽고db uri 없음");
  process.exit(1);
}

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

// PostgreSQL 연결 확인 (db.ts에서 Pool 초기화, 여기서 ping만)
import('./PostgreSQL').then(({ default: pool }) => {
  pool.query('SELECT 1')
    .then(() => console.log("PostgreSQL connected"))
    .catch(err => console.error("PostgreSQL connection error:", err));
});

// app.listen(PORT,"0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));

server.listen(4000,"0.0.0.0", () => {
  console.log("Server listening on 4000");
});

