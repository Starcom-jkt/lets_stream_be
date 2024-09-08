import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket } from "mysql2";

// Mendapatkan semua transaksi hadiah dari pengguna yang sedang login

export const getUserTransactions = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Query untuk mendapatkan semua transaksi milik pengguna yang sedang login
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      `SELECT giftName, amount, description, createdAt, userId, receivedId
       FROM gift_transaction 
       WHERE userId = ? OR receivedId = ? 
       ORDER BY createdAt DESC`,
      [userId, userId]
    );

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions found" });
    }

    // Looping transaksi untuk mendapatkan nama pengirim dan penerima
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let senderName = null;
        let receiverName = null;

        // Ambil nama pengirim berdasarkan userId
        const [sender]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.userId]
        );
        senderName = sender.length > 0 ? sender[0].username : "Unknown";

        // Ambil nama penerima berdasarkan receivedId
        const [receiver]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.receivedId]
        );
        receiverName = receiver.length > 0 ? receiver[0].username : "Unknown";

        return {
          giftName: transaction.giftName,
          description: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          transactionType: transaction.userId === userId ? "out" : "in",
          senderName, // Nama pengirim
          receiverName, // Nama penerima
        };
      })
    );

    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error fetching user transactions:", error); // Log error untuk debugging
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
      error: error.message, // Mengembalikan pesan error yang jelas
    });
  }
};

export const getUserTransactionsByUserId = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  // Memeriksa apakah user dengan id tersebut ada
  const [user]: [RowDataPacket[], any] = await pool.query(
    "SELECT * FROM user WHERE id = ?",
    [id]
  );

  if (!user || user.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const userId = user[0].id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Query untuk mendapatkan semua transaksi milik pengguna yang sedang login
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      `SELECT giftName, amount, description, createdAt, userId, receivedId
       FROM gift_transaction 
       WHERE userId = ? OR receivedId = ? 
       ORDER BY createdAt DESC`,
      [userId, userId]
    );

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions found" });
    }

    // Looping transaksi untuk mendapatkan nama pengirim dan penerima
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let senderName = null;
        let receiverName = null;

        // Ambil nama pengirim berdasarkan userId
        const [sender]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.userId]
        );
        senderName = sender.length > 0 ? sender[0].username : "Unknown";

        // Ambil nama penerima berdasarkan receivedId
        const [receiver]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.receivedId]
        );
        receiverName = receiver.length > 0 ? receiver[0].username : "Unknown";

        return {
          giftName: transaction.giftName,
          description: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          transactionType: transaction.userId === userId ? "out" : "in",
          senderName, // Nama pengirim
          receiverName, // Nama penerima
        };
      })
    );

    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error fetching user transactions:", error); // Log error untuk debugging
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
      error: error.message, // Mengembalikan pesan error yang jelas
    });
  }
};

const setStartOfDay = (date: string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} 00:00:00`;
};

const setEndOfDay = (date: string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} 23:59:59`;
};

export const filterByDate = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const userId = req.user?.id; // Mendapatkan userId dari req.user

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Validasi jika endDate lebih awal dari startDate
    if (
      startDate &&
      endDate &&
      new Date(endDate as string) < new Date(startDate as string)
    ) {
      return res.status(400).json({
        success: false,
        message: "You can't set an end date earlier than the start date",
      });
    }

    let query = `SELECT giftName, amount, description, createdAt, userId, receivedId, 
    CASE 
      WHEN userId = ? THEN 'out' 
      WHEN receivedId = ? THEN 'in' 
      ELSE 'unknown' 
    END AS transactionType 
    FROM gift_transaction 
    WHERE (userId = ? OR receivedId = ?)`;

    const params: any[] = [userId, userId, userId, userId];

    // Filter berdasarkan startDate dan endDate
    if (startDate && endDate) {
      query += ` AND createdAt BETWEEN ? AND ?`;
      const start = setStartOfDay(startDate as string);
      const end = setEndOfDay(endDate as string);
      params.push(start, end);
    } else if (startDate) {
      query += ` AND createdAt >= ?`;
      const start = setStartOfDay(startDate as string);
      params.push(start);
    } else if (endDate) {
      query += ` AND createdAt <= ?`;
      const end = setEndOfDay(endDate as string);
      params.push(end);
    }

    // Query ke database
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      query,
      params
    );

    // Jika tidak ada transaksi, kembalikan 404
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions during this time" });
    }

    // Looping transaksi untuk mendapatkan nama pengirim dan penerima
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let senderName = null;
        let receiverName = null;

        // Ambil nama pengirim berdasarkan userId
        const [sender]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.userId]
        );
        senderName = sender.length > 0 ? sender[0].username : "Unknown";

        // Ambil nama penerima berdasarkan receivedId
        const [receiver]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.receivedId]
        );
        receiverName = receiver.length > 0 ? receiver[0].username : "Unknown";

        return {
          giftName: transaction.giftName,
          description: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          transactionType: transaction.userId === userId ? "out" : "in",
          senderName, // Nama pengirim
          receiverName, // Nama penerima
        };
      })
    );

    // Jika ada transaksi, kirimkan data ke response
    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error filtering transactions by date:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering transactions by date",
      error: error.message,
    });
  }
};

export const filterByDatebyUserId = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const { id } = req.params; // Mendapatkan userId dari URL params

  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM user WHERE id = ?",
    [id]
  );

  if (user.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const userId = user[0].id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User ID not authenticated" });
  }
  if (!id) {
    return res
      .status(401)
      .json({ success: false, message: "User ID not provided" });
  }

  try {
    // Validasi jika endDate lebih awal dari startDate
    if (
      startDate &&
      endDate &&
      new Date(endDate as string) < new Date(startDate as string)
    ) {
      return res.status(400).json({
        success: false,
        message: "You can't set an end date earlier than the start date",
      });
    }

    let query = `SELECT giftName, amount, description, createdAt, userId, receivedId, 
    CASE 
      WHEN userId = ? THEN 'out' 
      WHEN receivedId = ? THEN 'in' 
      ELSE 'unknown' 
    END AS transactionType 
    FROM gift_transaction 
    WHERE (userId = ? OR receivedId = ?)`;

    const params: any[] = [userId, userId, userId, userId];

    // Filter berdasarkan startDate dan endDate
    if (startDate && endDate) {
      query += ` AND createdAt BETWEEN ? AND ?`;
      const start = setStartOfDay(startDate as string);
      const end = setEndOfDay(endDate as string);
      params.push(start, end);
    } else if (startDate) {
      query += ` AND createdAt >= ?`;
      const start = setStartOfDay(startDate as string);
      params.push(start);
    } else if (endDate) {
      query += ` AND createdAt <= ?`;
      const end = setEndOfDay(endDate as string);
      params.push(end);
    }

    // Query ke database
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      query,
      params
    );

    // Jika tidak ada transaksi, kembalikan 404
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions during this time" });
    }

    // Looping transaksi untuk mendapatkan nama pengirim dan penerima
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let senderName = null;
        let receiverName = null;

        // Ambil nama pengirim berdasarkan userId
        const [sender]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.userId]
        );
        senderName = sender.length > 0 ? sender[0].username : "Unknown";

        // Ambil nama penerima berdasarkan receivedId
        const [receiver]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.receivedId]
        );
        receiverName = receiver.length > 0 ? receiver[0].username : "Unknown";

        return {
          giftName: transaction.giftName,
          description: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          transactionType: transaction.userId === id ? "out" : "in",
          senderName, // Nama pengirim
          receiverName, // Nama penerima
        };
      })
    );

    // Jika ada transaksi, kirimkan data ke response
    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error filtering transactions by date:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering transactions by date",
      error: error.message,
    });
  }
};

export const filterIn = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Query untuk mendapatkan transaksi berdasarkan receivedId
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      `SELECT giftName, amount, description, createdAt, userId
       FROM gift_transaction 
       WHERE receivedId = ? 
       ORDER BY createdAt DESC`,
      [userId]
    );

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No incoming transactions" });
    }

    // Format transaksi dengan menambahkan nama pengirim (senderName)
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let senderName = null;

        // Cari nama pengirim berdasarkan userId
        const [sender]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.userId]
        );
        senderName = sender.length > 0 ? sender[0].username : "Unknown";

        return {
          giftName: transaction.giftName,
          description: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          senderName, // Nama pengirim
        };
      })
    );

    // Jika ada transaksi, kirimkan data ke response
    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error filtering 'in' transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering 'in' transactions",
      error: error.message,
    });
  }
};

export const filterInById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM user WHERE id = ?",
    [id]
  );

  const userId = user[0].id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Query untuk mendapatkan transaksi berdasarkan receivedId
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      `SELECT giftName, amount, description, createdAt, userId
       FROM gift_transaction 
       WHERE receivedId = ? 
       ORDER BY createdAt DESC`,
      [userId]
    );

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No incoming transactions" });
    }

    // Format transaksi dengan menambahkan nama pengirim (senderName)
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let senderName = null;

        // Cari nama pengirim berdasarkan userId
        const [sender]: [RowDataPacket[], any] = await pool.query(
          `SELECT username FROM user WHERE id = ?`,
          [transaction.userId]
        );
        senderName = sender.length > 0 ? sender[0].username : "Unknown";

        return {
          giftName: transaction.giftName,
          description: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          senderName, // Nama pengirim
        };
      })
    );

    // Jika ada transaksi, kirimkan data ke response
    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error filtering 'in' transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering 'in' transactions",
      error: error.message,
    });
  }
};

// Filter transaksi dengan tipe 'out' (pengirim)
export const filterOut = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Query untuk mendapatkan transaksi
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      `SELECT giftName, amount, description, createdAt, userId, receivedId
       FROM gift_transaction 
       WHERE userId = ? OR receivedId = ?
       ORDER BY createdAt DESC`,
      [userId, userId]
    );

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions found" });
    }

    // Looping transaksi untuk mendapatkan nama pengguna yang terkait
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let receiverName = null;

        // Jika transaksi keluar (out), cari nama penerima berdasarkan receivedId
        if (transaction.userId === userId) {
          const [receiver]: [RowDataPacket[], any] = await pool.query(
            `SELECT username FROM user WHERE id = ?`,
            [transaction.receivedId]
          );
          receiverName = receiver.length > 0 ? receiver[0].username : "Unknown";
        }
        // Jika transaksi masuk (in), cari nama pengirim berdasarkan userId
        else if (transaction.receivedId === userId) {
          const [sender]: [RowDataPacket[], any] = await pool.query(
            `SELECT username FROM user WHERE id = ?`,
            [transaction.userId]
          );
          receiverName = sender.length > 0 ? sender[0].username : "Unknown";
        }

        return {
          giftName: transaction.giftName,
          decription: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          transactionType: transaction.userId === userId ? "out" : "in",
          receiverName,
        };
      })
    );

    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error filtering transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering transactions",
      error: error.message,
    });
  }
};
export const filterOutById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM user WHERE id = ?",
    [id]
  );

  if (user.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const userId = user[0].id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    // Query untuk mendapatkan transaksi
    const [transactions]: [RowDataPacket[], any] = await pool.query(
      `SELECT giftName, amount, description, createdAt, userId, receivedId
       FROM gift_transaction 
       WHERE userId = ? OR receivedId = ?
       ORDER BY createdAt DESC`,
      [userId, userId]
    );

    // Jika tidak ada transaksi
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No transactions found" });
    }

    // Looping transaksi untuk mendapatkan nama pengguna yang terkait
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        let receiverName = null;

        // Jika transaksi keluar (out), cari nama penerima berdasarkan receivedId
        if (transaction.userId === userId) {
          const [receiver]: [RowDataPacket[], any] = await pool.query(
            `SELECT username FROM user WHERE id = ?`,
            [transaction.receivedId]
          );
          receiverName = receiver.length > 0 ? receiver[0].username : "Unknown";
        }
        // Jika transaksi masuk (in), cari nama pengirim berdasarkan userId
        else if (transaction.receivedId === userId) {
          const [sender]: [RowDataPacket[], any] = await pool.query(
            `SELECT username FROM user WHERE id = ?`,
            [transaction.userId]
          );
          receiverName = sender.length > 0 ? sender[0].username : "Unknown";
        }

        return {
          giftName: transaction.giftName,
          decription: transaction.description,
          createdAt: transaction.createdAt,
          amount: Math.round(transaction.amount * 100) / 100, // Membulatkan ke dua angka desimal
          transactionType: transaction.userId === userId ? "out" : "in",
          receiverName,
        };
      })
    );

    res.json({ success: true, transactions: formattedTransactions });
  } catch (error: any) {
    console.error("Error filtering transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering transactions",
      error: error.message,
    });
  }
};
