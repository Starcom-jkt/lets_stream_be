import pool from "../../../../db";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";
import fs from "fs";

interface admin extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  channelName: string;
  profilePicture: Date;
}

export const index = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    const [admin] = await pool.query<admin[]>("SELECT * FROM admin");

    res.render("adminv2/pages/admins/index", {
      admin,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Admin Settings",
    });
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/dashboard");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");
  const alert = { message: alertMessage, status: alertStatus };
  try {
    // Render halaman dengan data admin
    res.render("adminv2/pages/admins/create", {
      // admin,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Create Admin",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman admin
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};

export const actionCreate = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;
    const saltRounds = 10;
    const profilePicture = req.file?.filename || "";

    // Cek apakah username sudah ada
    const [checkUsername] = await pool.query<admin[]>(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );
    if (checkUsername.length > 0) {
      req.flash("alertMessage", "Username already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admins/create");
    }

    // Cek apakah email sudah ada
    const [checkEmail] = await pool.query<admin[]>(
      "SELECT * FROM admin WHERE email = ?",
      [email]
    );
    if (checkEmail.length > 0) {
      req.flash("alertMessage", "Email already exists");
      req.flash("alertStatus", "danger");
      return res.redirect("/admins/create");
    }

    // Hash the password
    const passwordBrcypted = await bcrypt.hash(password, saltRounds);

    // Insert admin ke database
    await pool.query(
      "INSERT INTO admin (username, password, profilePicture, email) VALUES (?, ?, ?, ?)",
      [username, passwordBrcypted, profilePicture, email]
    );

    req.flash("alertMessage", "Admin created successfully");
    req.flash("alertStatus", "success");
    res.redirect("/admins");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};

export const actionDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM admin WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Admin not found");
      req.flash("alertStatus", "danger");
    } else {
      req.flash("alertMessage", "Admin deleted successfully");
      req.flash("alertStatus", "success");
    }

    res.redirect("/admins");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};

export const indexEdit = async (req: Request, res: Response) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };
    // Ambil ID dari parameter request
    const { id } = req.params;

    // Ambil data dari tabel admin
    const [rows] = await pool.query<admin[]>(
      "SELECT * FROM admin WHERE id = ?",
      [id]
    );

    // Periksa apakah agen ditemukan
    if (rows.length === 0) {
      req.flash("alertMessage", "admin not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admins");
    }

    const admin = rows[0];

    // Render halaman dengan data admin
    res.render("adminv2/pages/admins/edit", {
      admin,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      // name: req.session.user.name,
      title: "Halaman Edit admin",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman admin
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};

// Handler untuk menangani pembaruan data agen

export const actionEdit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, previousProfilePicture } = req.body;
    let profilePicture = previousProfilePicture;

    // Jika pengguna mengunggah gambar baru, gunakan gambar baru
    if (req.file) {
      profilePicture = req.file.filename;

      // Hapus gambar lama dari server jika gambar baru diunggah
      if (previousProfilePicture) {
        fs.unlinkSync(`public/uploads/${previousProfilePicture}`);
      }
    }

    // Hashing password jika pengguna mengisi password baru
    let hashedPassword = password;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Update data admin di database
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE admin SET username = ?, password = ?, profilePicture = ? WHERE id = ?",
      [username, hashedPassword, profilePicture, id]
    );

    if (result.affectedRows === 0) {
      req.flash("alertMessage", "Admin not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admins");
    }

    req.flash("alertMessage", "Admin updated successfully");
    req.flash("alertStatus", "success");
    res.redirect("/admins");
  } catch (err: any) {
    req.flash("alertMessage", err.message);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};

// Mengubah status admin
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE admin SET status = !status WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admins");
    }
    req.flash("alertMessage", "Berhasil mengubah status admin");
    req.flash("alertStatus", "success");
    res.redirect("/admins");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};

export const changeStatusSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE admin SET isSuperAdmin = !isSuperAdmin WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      req.flash("alertMessage", "user not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admins");
    }
    req.flash("alertMessage", "Berhasil mengubah status admin");
    req.flash("alertStatus", "success");
    res.redirect("/admins");
  } catch (err: any) {
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admins");
  }
};
