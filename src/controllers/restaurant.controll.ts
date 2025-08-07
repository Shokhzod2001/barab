import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";
import { Reservation } from "../libs/types/reservation";

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

let reservations: Reservation[] = [];
let tables = [
  { id: "Window Table", capacity: 2, available: true },
  { id: "Booth", capacity: 4, available: true },
  { id: "Private Room", capacity: 8, available: true },
  { id: "Bar Seating", capacity: 1, available: true },
  { id: "Outdoor Patio", capacity: 6, available: true },
];
restaurantController.createNewReserve = async (req: Request, res: Response) => {
  try {
    const { name, phone, persons, date, time, table } = req.body;

    // Validate input
    if (!name || !phone || !persons || !date || !time || !table) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if table is available
    const selectedTable = tables.find((t) => t.id === table);
    if (!selectedTable) {
      return res.status(400).json({ error: "Invalid table selection" });
    }

    // Check capacity
    if (selectedTable.capacity < parseInt(persons)) {
      return res.status(400).json({
        error: `Selected table only accommodates ${selectedTable.capacity} people`,
      });
    }

    // Check for existing reservation at same time/date/table
    const existingReservation = reservations.find(
      (r) => r.date === date && r.time === time && r.table === table
    );

    if (existingReservation) {
      return res.status(400).json({
        error: "This table is already reserved for the selected time",
      });
    }

    // Create new reservation
    const newReservation: Reservation = {
      id: Date.now(),
      name,
      phone,
      persons: parseInt(persons),
      date,
      time,
      table,
      createdAt: new Date(),
      status: "confirmed",
    };

    reservations.push(newReservation);

    // In a real app, you would send a confirmation email/SMS here

    res.status(201).json({
      success: true,
      message: "Reservation confirmed!",
      reservation: newReservation,
    });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

restaurantController.getReserves = async (req: Request, res: Response) => {
  try {
    // Sort by date (newest first)
    const sortedReservations = [...reservations].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({
      success: true,
      count: sortedReservations.length,
      reservations: sortedReservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

restaurantController.getAvailableTables = async (
  req: Request,
  res: Response
) => {
  try {
    const { date, time, persons } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: "Date and time are required" });
    }

    // Filter out tables that are already reserved at this time
    const reservedTables = reservations
      .filter((r) => r.date === date && r.time === time)
      .map((r) => r.table);

    const availableTables = tables
      .filter(
        (table) =>
          !reservedTables.includes(table.id) &&
          (!persons || table.capacity >= parseInt(persons as string))
      )
      .map((table) => ({
        id: table.id,
        capacity: table.capacity,
      }));

    res.json({
      success: true,
      availableTables,
      requestedTime: `${date} at ${time}`,
    });
  } catch (error) {
    console.error("Error checking tables:", error);
    res.status(500).json({ error: "Failed to check table availability" });
  }
};

restaurantController.cancelReservation = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const reservation = reservations.find((r) => r.id === parseInt(id));

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    reservation.status = "cancelled";

    res.json({
      success: true,
      message: "Reservation cancelled",
      reservation,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ error: "Failed to cancel reservation" });
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
