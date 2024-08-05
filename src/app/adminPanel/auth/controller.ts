import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../../../../db";
import jwt from "jsonwebtoken";

const jwtSecretKey = "your_secret_key_here";

export const actionSignin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    // Query untuk menemukan admin berdasarkan email
    const [result] = await pool.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    const rows = result as any[];

    if (rows.length > 0) {
      const admin = rows[0];
      // Cek status admin
      if (admin.status === "Y") {
        // Cek password
        // const checkPassword = await bcrypt.compare(password, admin.password);

        // if (checkPassword) {
        if (password === admin.password) {
          // Set session user
          req.session.user = {
            id: admin.id,
            username: admin.username,
            picture: admin.picture,
            status: admin.status,
            email: admin.email,
            name: admin.name,
          };
          // console.log("req.session.user", req.session.user);
          res.redirect("/admin");
        } else {
          req.flash("alertMessage", "Kata sandi yang anda inputkan salah");
          req.flash("alertStatus", "danger");
          res.redirect("/admin/login");
        }
      } else {
        req.flash("alertMessage", "Mohon maaf status anda belum aktif");
        req.flash("alertStatus", "danger");
        res.redirect("/admin/login");
      }
    } else {
      req.flash("alertMessage", "Email yang anda inputkan salah");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/login");
    }
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/login");
  }
};
export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel game
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    //   const [game] = await pool.query("SELECT * FROM game");
    // Render halaman dengan data game
    res.render("admin/auth/index", {
      // game,
      alert,
      // name: req.session.user.name,
      title: "Log In",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman game
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/");
  }
};

export const actionLogout = async (req: Request, res: Response) => {
  // Menghancurkan sesi
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out.");
    }

    // Menghapus cookie sesi (opsional, jika diperlukan)
    res.clearCookie("connect.sid"); // 'connect.sid' adalah nama cookie default, sesuaikan jika berbeda

    // Redirect ke halaman login
    res.redirect("/admin/login");
  });
};
