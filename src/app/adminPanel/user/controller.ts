import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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
    const [user] = await pool.query("SELECT * FROM user");
    console.log(user);
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
    res.redirect("/");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    // Render halaman dengan data user
    res.render("admin/user/create", {
      // name: req.session.user.name,
      title: "Halaman create user",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman user
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/user");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { username, playerId, nickname, balance } = req.body;
    // const createTime = formatDate(new Date());
    const [rows] = await pool.query(
      "INSERT INTO user ( username, playerId, nickname, balance) VALUES (?, ?, ?, ?)",
      [username, playerId, nickname, balance]
    );
    res.redirect("/user");
  } catch (err) {
    res.send(err);
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

    res.redirect("/user");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/user");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
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
      return res.redirect("/user");
    }

    const user = rows[0];

    // Render halaman dengan data user
    res.render("admin/user/edit", {
      user,
      // name: req.session.user.name,
      title: "Halaman Edit user",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman user
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/user");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, playerId, nickname, balance } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET username = ?, playerId = ?, nickname = ?, balance = ? WHERE id = ?",
      [username, playerId, nickname, balance, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/user");
    }

    req.flash("alertMessage", "Berhasil mengedit user");
    req.flash("alertStatus", "success");
    res.redirect("/user");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/user");
  }
};
