import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface Gift extends RowDataPacket {
  id: number;
  img: string;
  giftName: string;
  giftLink: string;
  price: number;
  create_time: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    // Ambil data dari tabel gift
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    const [gift] = await pool.query("SELECT * FROM gift");
    // Render halaman dengan data gift
    res.render("adminv2/pages/gift/index", {
      gift,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Halaman gift",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman gift
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/gift");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const alert = { message: alertMessage, status: alertStatus };
    // Render halaman dengan data gift
    res.render("adminv2/pages/gift/create", {
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Halaman create gift",
      alert,
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman gift
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/gift");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { giftName, giftLink, price } = req.body;
    const img = req.file?.filename || "";
    // const createTime = formatDate(new Date());
    const [rows] = await pool.query(
      "INSERT INTO gift ( img, giftName, giftLink, price) VALUES ( ?, ?, ?, ?)",
      [img, giftName, giftLink, price]
    );

    req.flash("alertMessage", "Berhasil tambah gift");
    req.flash("alertStatus", "success");
    res.redirect("/admin/gift");
  } catch (err) {
    res.send(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM gift WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "gift not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Berhasil hapus gift");
      req.flash("alertStatus", "success");
    }

    res.redirect("/admin/gift");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/gift");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel gift
    const [rows] = await pool.query<Gift[]>("SELECT * FROM gift WHERE id = ?", [
      id,
    ]);

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "gift not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/gift");
    }

    const gift = rows[0];

    // Render halaman dengan data gift
    res.render("adminv2/pages/gift/edit", {
      gift,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Halaman Edit gift",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman gift
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/gift");
  }
};

// Handler untuk menangani pembaruan data agen
export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { img, giftName, giftLink, price } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE gift SET img = ?, giftName = ?, giftLink = ?, price = ? WHERE id = ?",
      [img, giftName, giftLink, price, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "gift not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/gift");
    }

    req.flash("alertMessage", "Berhasil mengedit gift");
    req.flash("alertStatus", "success");
    res.redirect("/admin/gift");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/gift");
  }
};
