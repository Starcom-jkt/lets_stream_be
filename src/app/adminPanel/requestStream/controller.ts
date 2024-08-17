import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  balance: number;
  create_time: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel user
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    const [usersInRequestStream] = await pool.query(`
      SELECT u.*
      FROM user u
      INNER JOIN request_stream r ON u.id = r.userId
      WHERE u.stream = 0
    `);
    // Render halaman dengan data user
    res.render("admin/request/index", {
      usersInRequestStream,
      alert,
      // users,
      // name: req.session.user.name,
      title: "Halaman Request Stream",
    });
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin");
  }
};

export const requestDetail = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    const { id } = req.params;
    // const [request] = await pool.query<ResultSetHeader>(
    //   "SELECT * FROM request_stream WHERE id = ?",
    //   [id]
    // );

    const [rows] = await pool.query<User[]>("SELECT * FROM user WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/user");
    }

    const user = rows[0];

    // Render halaman dengan data user
    res.render("admin/request/detail", {
      // request,
      alert,
      user,
      // name: req.session.user.name,
      title: "Halaman Request Stream",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman user
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin");
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
export const confirmStream = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [dataUser] = await pool.query<User[]>(
      "SELECT * FROM user WHERE id = ?",
      [id]
    );

    // Lakukan update pada stream user
    const [updateResult] = await pool.query<ResultSetHeader>(
      "UPDATE user SET stream = ?, channelName = ? WHERE id = ?",
      [1, dataUser[0].username, id]
    );

    // Cek apakah update berhasil
    if (updateResult.affectedRows === 0) {
      req.flash("alertMessage", "User not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/request");
    }

    const [sendNotif] = await pool.query<ResultSetHeader>(
      "INSERT INTO notifications (userId, title, message) VALUES (?, ?, ?)",
      [
        id,
        "New Message",
        "Your request to stream is accepted! Please download the app for streaming",
      ]
    );

    // Hapus entri dari request_stream berdasarkan userId (asumsi ini yang dimaksud)
    const [deleteResult] = await pool.query<ResultSetHeader>(
      "DELETE FROM request_stream WHERE userId = ?",
      [id]
    );

    // Cek apakah penghapusan berhasil
    if (deleteResult.affectedRows === 0) {
      req.flash("alertMessage", "No matching request found to delete");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/request");
    }

    // Jika semua berhasil, berikan respons sukses
    req.flash(
      "alertMessage",
      "Berhasil mengubah status user dan menghapus request"
    );
    req.flash("alertStatus", "success");
    res.redirect("/admin/request");
  } catch (err: any) {
    console.error("Error during confirmStream:", err);
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/request");
  }
};

export const rejectStream = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM request_stream WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/request");
    }
    req.flash("alertMessage", "Berhasil menolak user menjadi agent");
    req.flash("alertStatus", "success");
    res.redirect("/admin/request");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/request");
  }
};
