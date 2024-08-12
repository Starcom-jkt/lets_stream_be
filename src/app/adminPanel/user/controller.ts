import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

interface User extends RowDataPacket {
  id: number;
  playerId: number;
  username: string;
  balance: number;
  create_time: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel user
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    const [user] = await pool.query("SELECT * FROM user where stream = 0");
    // Render halaman dengan data user
    res.render("admin/user/index", {
      user,
      alert,
      // name: req.session.user.name,
      title: "Halaman user",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman user
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    // Render halaman dengan data user
    res.render("admin/user/create", {
      // name: req.session.user.name,
      alert,
      title: "Halaman create user",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman user
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/user");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;
    const saltRounds = 10;
    const profilePicture = req.file?.filename || "";

    const [checkEmail] = await pool.query<User[]>(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (checkEmail.length > 0) {
      req.flash("alertMessage", "Email already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/user/create");
    }
    const [checkUsername] = await pool.query<User[]>(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );

    if (checkUsername.length > 0) {
      req.flash("alertMessage", "Username already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/user/create");
    }
    // Hash the password
    const passwordBrcypted = await bcrypt.hash(password, saltRounds);
    await pool.query(
      "INSERT INTO user (email, username, password, profilePicture) VALUES (?, ?, ?, ?);",
      [email, username, passwordBrcypted, profilePicture]
    );

    res.redirect("/admin/user");
  } catch (err: any) {
    res.status(500).send(err.message);
    console.log(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM user WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus user");
      req.flash("alertStatus", "success");
    }

    res.redirect("/admin/user");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/user");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel user
    const [rows] = await pool.query<User[]>("SELECT * FROM user WHERE id = ?", [
      id,
    ]);

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/user");
    }

    const user = rows[0];

    // Render halaman dengan data user
    res.render("admin/user/edit", {
      user,
      alert,
      // name: req.session.user.name,
      title: "Halaman Edit user",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman user
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/user");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, channelName } = req.body;
    const passwordBrcypted = await bcrypt.hash(password, 10);
    const profilePicture = req.file?.filename || "";

    const [checkUsername] = await pool.query<User[]>(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    if (checkUsername.length > 0) {
      req.flash("alertMessage", "Username already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/user/create");
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET  username = ?, profilePicture = ?, channelName = ?, password = ? WHERE id = ?",
      [username, profilePicture, channelName, passwordBrcypted, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/user");
    }

    req.flash("alertMessage", "Berhasil mengedit user");
    req.flash("alertStatus", "success");
    res.redirect("/admin/user");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/user");
  }
};

export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET status = !status WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/user");
    }
    req.flash("alertMessage", "Berhasil mengubah status user");
    req.flash("alertStatus", "success");
    res.redirect("/admin/user");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/user");
  }
};
