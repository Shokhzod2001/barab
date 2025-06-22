import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";
import AuthService from "./models/Auth.service";

/** 1 - ENTRANCE **/
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("./uploads"));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(MORGAN_FORMAT));

/** 2 - TOKENS IN COOKIES **/
const authService = new AuthService();

const setMemberLocals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["accessToken"];
  let member = null;

  if (token) {
    try {
      member = await authService.checkAuth(token);
    } catch (err) {
      console.log("Invalid or expired token:", err);
      res.clearCookie("accessToken");
    }
  }

  res.locals.member = member;
  next();
};

app.use("/admin", setMemberLocals);

/** 3 - VIEWS **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4 - ROUTERS **/
app.use("/admin", routerAdmin); // SSR
app.use("/", router); // SPA

export default app;
