import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months start at 0!
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

interface Agent extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  create_time: Date;
  profile_picture: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel agent
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    const [agent] = await pool.query("SELECT * FROM agent");

    // Render halaman dengan data agent
    res.render("admin/agent/index", {
      agent,
      alert,
      // name: req.session.user.name,
      title: "Halaman Agent",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman agent
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    // Render halaman dengan data agent
    res.render("admin/agent/create", {
      // agent,
      // name: req.session.user.name,
      title: "Halaman create Agent",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman agent
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/agent");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { name, username, password } = req.body;
    const saltRounds = 10;
    const profile_picture = req.file?.filename || "";

    // Hash the password
    const passwordBrcypted = await bcrypt.hash(password, saltRounds);

    const createTime = formatDate(new Date());
    const [rows] = await pool.query(
      "INSERT INTO agent (create_time, name, username, profile_picture, password) VALUES (?, ?, ?, ?, ?)",
      [createTime, name, username, profile_picture, passwordBrcypted]
    );

    console.log(profile_picture);
    res.redirect("/admin/agent");
  } catch (err: any) {
    res.status(500).send(err.message);
    console.log(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM agent WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus agent");
      req.flash("alertStatus", "success");
    }

    res.redirect("/agent");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/agent");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel agent
    const [rows] = await pool.query<Agent[]>(
      "SELECT * FROM agent WHERE id = ?",
      [id]
    );

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/agent");
    }

    const agent = rows[0];

    // Render halaman dengan data agent
    res.render("admin/agent/edit", {
      agent,
      // name: req.session.user.name,
      title: "Halaman Edit Agent",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman agent
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/agent");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, username, profile_picture } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE agent SET name = ?, username = ?, profile_picture = ? WHERE id = ?",
      [name, username, profile_picture, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/agent");
    }

    req.flash("alertMessage", "Berhasil mengedit agent");
    req.flash("alertStatus", "success");
    res.redirect("/agent");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/agent");
  }
};
