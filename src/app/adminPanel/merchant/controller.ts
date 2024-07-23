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

interface Merchant extends RowDataPacket {
  id: number;
  merchantCode: string;
  merchantName: string;
  merchantLogo: string;
  useBranch: number;
  create_time: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel merchant
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    const [merchant] = await pool.query("SELECT * FROM merchant");
    // Render halaman dengan data merchant
    res.render("admin/merchant/index", {
      merchant,
      alert,
      // name: req.session.user.name,
      title: "Halaman merchant",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman merchant
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    // Render halaman dengan data merchant
    res.render("admin/merchant/create", {
      // name: req.session.user.name,
      title: "Halaman create merchant",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman merchant
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/merchant");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { merchantCode, merchantName, merchantLogo, useBranchLogo } =
      req.body;
    // const createTime = formatDate(new Date());
    const [rows] = await pool.query(
      "INSERT INTO merchant ( merchantCode, merchantName, merchantLogo, useBranchLogo) VALUES ( ?, ?, ?, ?)",
      [merchantCode, merchantName, merchantLogo, useBranchLogo]
    );
    res.redirect("/merchant");
  } catch (err) {
    res.send(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM merchant WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "merchant not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus merchant");
      req.flash("alertStatus", "success");
    }

    res.redirect("/merchant");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/merchant");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel merchant
    const [rows] = await pool.query<Merchant[]>(
      "SELECT * FROM merchant WHERE id = ?",
      [id]
    );

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "merchant not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/merchant");
    }

    const merchant = rows[0];

    // Render halaman dengan data merchant
    res.render("admin/merchant/edit", {
      merchant,
      // name: req.session.user.name,
      title: "Halaman Edit merchant",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman merchant
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/merchant");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { merchantCode, merchantName, merchantLogo } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE merchant SET merchantCode = ?, merchantName = ?, merchantLogo = ?, WHERE id = ?",
      [merchantCode, merchantName, merchantLogo, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "merchant not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/merchant");
    }

    req.flash("alertMessage", "Berhasil mengedit merchant");
    req.flash("alertStatus", "success");
    res.redirect("/merchant");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/merchant");
  }
};
