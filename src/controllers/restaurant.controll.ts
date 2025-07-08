import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";

const memberService = new MemberService();
const authService = new AuthService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome", err);
    res.redirect("/admin");
  }
};

restaurantController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("signup");
  } catch (err) {
    console.log("Error, getSignup", err);
    res.redirect("/admin");
  }
};

restaurantController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login");
  } catch (err) {
    console.log("Error, getLogin", err);
    res.redirect("/admin");
  }
};

restaurantController.processSignup = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("processSignup");
    console.log("req.body", req.body);
    const file = req.file;
    console.log("file:", file);
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.RESTAURANT;

    const result = await memberService.processSignup(newMember);
    const plainResult = result.toObject ? result.toObject() : { ...result };
    const token = await authService.createToken(plainResult);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });
    res.redirect("/admin/product/all");
  } catch (err) {
    console.log("Error, processSignup", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/signup") </script>`
    );
  }
};

restaurantController.processLogin = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("processLogin");

    const input: LoginInput = req.body,
      result = await memberService.processLogin(input),
      plainResult = result.toObject ? result.toObject() : { ...result },
      token = await authService.createToken(plainResult);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });
    res.redirect("/admin/product/all");
  } catch (err) {
    console.log("Error, processLogin", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/login") </script>`
    );
  }
};

restaurantController.logout = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");
    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
    res.redirect("/admin");
  } catch (err) {
    console.log("Error, logout", err);
    res.redirect("/admin");
  }
};

restaurantController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers ");
    const result = await memberService.getUsers();

    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers:", err);
    res.redirect("/admin/login");
  }
};

restaurantController.getChefs = async (req: Request, res: Response) => {
  try {
    console.log("getChefs ");
    const result = await memberService.getChefs();

    res.render("chefs", { chefs: result });
  } catch (err) {
    console.log("Error, getChefs:", err);
    res.redirect("/admin/login");
  }
};

restaurantController.updateChosenUSer = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUSer ");
    const result = await memberService.updateChosenUSer(req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error updateChosenUSer ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

restaurantController.createNewChef = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createNewChef");
    console.log("req.body", req.body);
    const file = req.file;
    console.log("file:", file);
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newChef: MemberInput = req.body;
    newChef.memberImage = file?.path.replace(/\\/g, "/");
    newChef.memberType = MemberType.CHEF;

    const result = await memberService.createNewChef(newChef);

    res.send(
      `<script> alert("Succesful creation!"); window.location.replace("/admin/chef/all") </script>`
    );
  } catch (err) {
    console.log("Error, createNewChef", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/chef/all") </script>`
    );
  }
};

restaurantController.checkAuthVerification = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("checkAuthVerification");
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);

    if (req.member) {
      res.send(`<script> alert("${req.member.memberNick}") </script>`);
    } else {
      res.send(`<script> alert("${Message.NOT_AUTHENTICATED}") </script>`);
    }
  } catch (err) {
    console.log("Error, checkAuthVerification", err);
    res.send(`<script> alert("${Message.NOT_AUTHENTICATED}") </script>`);
  }
};

restaurantController.verifyRestaurant = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);

    if (!req.member || req.member.memberType !== MemberType.RESTAURANT) {
      const message = Message.NOT_AUTHENTICATED;
      return res.send(
        `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`
      );
    }

    next();
  } catch (err) {
    console.log("Error, verifyRestaurant", err);
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`
    );
  }
};

export default restaurantController;
