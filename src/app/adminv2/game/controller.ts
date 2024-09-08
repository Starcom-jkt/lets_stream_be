import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months start at 0!
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

interface game extends RowDataPacket {
  id: number;
  gameCode: string;
  gameName: string;
  create_time: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel game
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    const [game] = await pool.query("SELECT * FROM game");
    // Render halaman dengan data game
    res.render("adminv2/pages/game/index", {
      game,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Halaman game",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman game
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/game");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    const [genre] = await pool.query("SELECT * FROM genre");
    // Render halaman dengan data game
    res.render("adminv2/pages/game/create", {
      name: req.session.user?.name,
      email: req.session.user?.email,
      genre,
      title: "Halaman create game",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman game
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/game");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { gameCode, gameName, gameLink, genre } = req.body;
    const gameImg = req.file?.filename || "";

    const [rows] = await pool.query(
      "INSERT INTO game (genre, gameCode, gameName, gameLink, gameImg) VALUES (?, ?, ?, ?, ?)",
      [genre, gameCode, gameName, gameLink, gameImg]
    );
    res.redirect("/admin/game");
  } catch (err) {
    res.status(500).send(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM game WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "game not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus game");
      req.flash("alertStatus", "success");
    }

    res.redirect("/admin/game");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/game");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    // Ambil ID dari parameter request
    const { id } = req.params;
    const [genre] = await pool.query("SELECT * FROM genre");
    // Ambil data dari tabel game
    const [rows] = await pool.query<game[]>("SELECT * FROM game WHERE id = ?", [
      id,
    ]);

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "game not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/game");
    }

    const game = rows[0];

    // Render halaman dengan data game
    res.render("adminv2/pages/game/edit", {
      game,
      genre,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Halaman Edit game",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman game
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/game");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { genre, gameName, gameCode, gameLink } = req.body;
    const gameImg = req.file?.filename || "";

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE game SET genre = ?, gameCode = ?, gameName = ?, gameLink = ?, gameImg = ? WHERE id = ?",
      [genre, gameCode, gameName, gameLink, gameImg, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "game not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/game");
    }

    req.flash("alertMessage", "Berhasil mengedit game");
    req.flash("alertStatus", "success");
    res.redirect("/admin/game");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/game");
  }
};
