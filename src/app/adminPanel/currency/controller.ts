import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const index = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");

    const [currency] = await pool.query("SELECT * FROM currency");
    const alert = { message: alertMessage, status: alertStatus };
    res.render("admin/currency/index", {
      currency,
      alert,
      title: "Halaman currency",
    });
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/");
  }
};

export const indexCreate = (req: Request, res: Response) => {
  res.render("admin/currency/create", {
    title: "Halaman create currency",
  });
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { currency, codeIso, symbol } = req.body;
    await pool.query(
      "INSERT INTO currency (currency, codeIso, symbol) VALUES (?, ?, ?)",
      [currency, codeIso, symbol]
    );
    res.redirect("/admin/currency");
  } catch (err) {
    res.send(err);
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM currency WHERE id = ?", [id]);
    res.redirect("/admin/currency");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/currency");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM currency WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      req.flash("alertMessage", "currency not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/currency");
    }
    res.render("admin/currency/edit", {
      currency: rows[0],
      title: "Halaman Edit currency",
    });
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/currency");
  }
};

export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currency, codeIso, symbol } = req.body;
    await pool.query(
      "UPDATE currency SET currency = ?, codeIso = ?, symbol = ? WHERE id = ?",
      [currency, codeIso, symbol, id]
    );
    res.redirect("/admin/currency");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/currency");
  }
};
