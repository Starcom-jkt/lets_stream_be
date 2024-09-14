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
    res.render("adminv2/pages/agent/index", {
      agent,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      // name: req.session.user.name,
      title: "Halaman Agent",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman agent
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/");
  }
};

export const indexCreate = async (req: Request, res: Response) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");
  const alert = { message: alertMessage, status: alertStatus };
  try {
    // Render halaman dengan data agent
    res.render("adminv2/pages/agent/create", {
      // agent,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
      title: "Halaman create Agent",
    });
  } catch (err: any) {
    // Jika terjadi kesalahan, redirect ke halaman agent
    req.flash("alertMessage", `${err.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/admin/agent");
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
    res.render("adminv2/pages/agent/edit", {
      agent,
      alert,
      name: req.session.user?.name,
      email: req.session.user?.email,
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

export const getUserLiveStreamReport = async (req: Request, res: Response) => {
  const { id } = req.params; // ID dari user yang ingin diambil laporannya
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    // Ambil informasi user
    const [userRows] = await pool.query<RowDataPacket[]>(
      `SELECT username FROM user WHERE id = ?`,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).send("User not found");
    }

    const username = userRows[0].username;

    // Ambil total durasi streaming dan total viewers langsung dari stream_result
    const [totalStreamData] = await pool.query<RowDataPacket[]>(
      `SELECT 
        IFNULL(SUM(r.duration), 0) AS totalDuration, 
        IFNULL(SUM(r.total_view), 0) AS totalViewers 
      FROM stream_result r
      JOIN stream_session s ON r.stream_sessionId = s.id
      WHERE s.userId = ?`,
      [id]
    );

    const { totalDuration, totalViewers } = totalStreamData[0];

    // Fungsi untuk memformat durasi ke dalam menit dan detik
    const formatDuration = (seconds: number): string => {
      if (seconds < 60) {
        return `${seconds} seconds`;
      } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds === 0
          ? `${minutes} minutes`
          : `${minutes} minutes ${remainingSeconds} seconds`;
      }
    };

    // Format total durasi sebelum dikirim ke view
    const formattedTotalDuration = formatDuration(totalDuration);

    // Dapatkan total jumlah sesi untuk pagination
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total 
       FROM stream_session 
       WHERE userId = ?`,
      [id]
    );

    const totalSessions = countRows[0]?.total || 0;

    // Ambil 10 sesi streaming terbaru berdasarkan pagination
    const [streamRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        s.title, 
        s.thumbnail, 
        r.duration, 
        r.total_view, 
        s.createdAt 
      FROM stream_result r
      JOIN stream_session s ON r.stream_sessionId = s.id
      WHERE s.userId = ? 
      ORDER BY s.createdAt DESC 
      LIMIT ? OFFSET ?`,
      [id, limit, offset]
    );

    // Format durasi untuk setiap stream
    const formattedStreams = streamRows.map((stream) => ({
      ...stream,
      formattedDuration: formatDuration(stream.duration),
    }));

    const totalPages = Math.ceil(totalSessions / limit);

    // Kirimkan data laporan ke view
    res.render("adminv2/pages/agent/liveReport", {
      title: "Live Stream Report",
      name: req.session.user?.username,
      email: req.session.user?.email,
      username,
      totalDuration: formattedTotalDuration, // Durasi total sudah diformat
      totalViewers,
      streams: formattedStreams, // Streams dengan durasi yang sudah diformat
      currentPage: page,
      totalPages,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
