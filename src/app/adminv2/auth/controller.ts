import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../../../../db";
import jwt from "jsonwebtoken";

const jwtSecretKey = "your_secret_key_here";

export const actionSignin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [result] = await pool.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    const rows = result as any[];

    if (rows.length > 0) {
      const admin = rows[0];
      // Cek admin status
      if (admin.status === 1) {
        const checkPassword = await bcrypt.compare(password, admin.password);

        if (checkPassword) {
          // if (password === admin.password) {
          req.session.user = {
            id: admin.id,
            username: admin.username,
            picture: admin.picture,
            status: admin.status,
            email: admin.email,
            name: admin.name,
          };
          res.redirect("/admin/dashboard");
        } else {
          req.flash("alertMessage", "Wrong password");
          req.flash("alertStatus", "danger");
          res.redirect("/admin/auth");
        }
      } else {
        req.flash("alertMessage", "Sorry your account is not active");
        req.flash("alertStatus", "danger");
        res.redirect("/admin/auth");
      }
    } else {
      req.flash("alertMessage", "Wrong username");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/auth");
    }
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/auth");
  }
};
export const index = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    res.render("adminv2/pages/auth/index", {
      alert,
      title: "Log In",
    });
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/auth");
  }
};
export const actionLogout = async (req: Request, res: Response) => {
  // Menghancurkan sesi
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out.");
    }

    res.clearCookie("connect.sid");

    res.redirect("/admin/auth");
  });
};
