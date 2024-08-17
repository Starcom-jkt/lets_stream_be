import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

interface Agent extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  channelName: string;
  profilePicture: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel agent
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    const [agent] = await pool.query("SELECT * FROM user where stream = 1");
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
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");
  const alert = { message: alertMessage, status: alertStatus };
  try {
    // Render halaman dengan data agent
    res.render("admin/agent/create", {
      // agent,
      alert,
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
    const { channelName, username, password, email } = req.body;
    const saltRounds = 10;
    const profilePicture = req.file?.filename || "";

    const [checkChannelName] = await pool.query<Agent[]>(
      "SELECT * FROM user WHERE channelName = ?",
      [channelName]
    );
    if (checkChannelName.length > 0) {
      req.flash("alertMessage", "Channel name already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent/create");
    }

    const [checkEmail] = await pool.query<Agent[]>(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (checkEmail.length > 0) {
      req.flash("alertMessage", "Email already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent/create");
    }
    const [checkUsername] = await pool.query<Agent[]>(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );

    if (checkUsername.length > 0) {
      req.flash("alertMessage", "Username already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent/create");
    }
    // Hash the password
    const passwordBrcypted = await bcrypt.hash(password, saltRounds);
    const stream = 1;
    await pool.query(
      "INSERT INTO user ( email, username, password, profilePicture, stream, channelName) VALUES (?, ?, ?, ?, ?, ?);",
      [email, username, passwordBrcypted, profilePicture, stream, channelName]
    );

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
      "DELETE FROM user WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus agent");
      req.flash("alertStatus", "success");
    }

    res.redirect("/admin/agent");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/agent");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel agent
    const [rows] = await pool.query<Agent[]>(
      "SELECT * FROM user WHERE id = ?",
      [id]
    );

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent");
    }

    const agent = rows[0];

    // Render halaman dengan data agent
    res.render("admin/agent/edit", {
      agent,
      alert,
      // name: req.session.user.name,
      title: "Halaman Edit Agent",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman agent
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/agent");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, channelName } = req.body;
    const passwordBrcypted = await bcrypt.hash(password, 10);
    const profilePicture = req.file?.filename || "";

    const [checkChannelName] = await pool.query<Agent[]>(
      "SELECT * FROM user WHERE channelName = ?",
      [channelName]
    );
    if (checkChannelName.length > 0) {
      req.flash("alertMessage", "Channel name already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent/create");
    }
    const [checkUsername] = await pool.query<Agent[]>(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    if (checkUsername.length > 0) {
      req.flash("alertMessage", "Username already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent/create");
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET  username = ?, profilePicture = ?, channelName = ?, password = ? WHERE id = ?",
      [username, profilePicture, channelName, passwordBrcypted, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent");
    }

    req.flash("alertMessage", "Berhasil mengedit agent");
    req.flash("alertStatus", "success");
    res.redirect("/admin/agent");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/agent");
  }
};

export const changeStatus = async (req: Request, res: Response) => {
  try {
    console.log("berhasil status");
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET status = !status WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent");
    }
    req.flash("alertMessage", "Berhasil mengubah status agent");
    req.flash("alertStatus", "success");
    res.redirect("/admin/agent");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/agent");
  }
};

export const changeStatusStream = async (req: Request, res: Response) => {
  console.log("berhasil stream");
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET stream = !stream WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Agent not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/agent");
    }
    req.flash("alertMessage", "Berhasil mengubah status agent");
    req.flash("alertStatus", "success");
    res.redirect("/admin/agent");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/agent");
  }
};
