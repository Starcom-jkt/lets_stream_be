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

interface Language extends RowDataPacket {
  id: number;
  languageName: string;
  languageCode: string;
}

export const index = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    const [language] = await pool.query("SELECT * FROM language");

    res.render("admin/language/index", {
      language,
      alert,
      title: "Halaman language",
    });
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    // Render halaman dengan data language
    res.render("admin/language/create", {
      // name: req.session.user.name,
      title: "Halaman create language",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman language
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/language");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { languageName, languageCode } = req.body;
    // const createTime = formatDate(new Date());
    const [rows] = await pool.query(
      "INSERT INTO language ( languageName, languageCode) VALUES ( ?, ?)",
      [languageName, languageCode]
    );
    res.redirect("/language");
  } catch (err) {
    res.send(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM language WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "language not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus language");
      req.flash("alertStatus", "success");
    }

    res.redirect("/language");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/language");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel language
    const [rows] = await pool.query<Language[]>(
      "SELECT * FROM language WHERE id = ?",
      [id]
    );

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "language not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/language");
    }

    const language = rows[0];

    // Render halaman dengan data language
    res.render("admin/language/edit", {
      language,
      // name: req.session.user.name,
      title: "Halaman Edit language",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman language
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/language");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { languageName, languageCode } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE language SET languageName = ?, languageCode = ? WHERE id = ?",
      [languageName, languageCode, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "language not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/language");
    }

    req.flash("alertMessage", "Berhasil mengedit language");
    req.flash("alertStatus", "success");
    res.redirect("/language");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/language");
  }
};
