import { Request, Response } from "express";
import pool from "../../../../db";
import { RowDataPacket, FieldPacket } from "mysql2"; // Import types for MySQL results

// export const getAllStreamResults = async (req: Request, res: Response) => {
//   const userId = req.user?.id;
//   console.log("userId", userId);
//   if (!userId) {
//     return res.status(401).json({ message: "Error: No userId found" });
//   }

//   try {
//     const [data] = await pool.query(
//       `
//         SELECT * FROM stream_result where stream_sessionId IN (SELECT id FROM stream_session where userId = ?)
//           `,
//       [userId]
//     );

//     res.json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching stream results", error });
//   }
// };

export const getAllStreamResults = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  // console.log("userId", userId);
  if (!userId) {
    return res.status(401).json({ message: "Error: No userId found" });
  }

  try {
    const [data] = await pool.query<RowDataPacket[]>(
      `
      SELECT * 
FROM stream_result 
WHERE stream_sessionId IN (
    SELECT id 
    FROM stream_session 
    WHERE userId = ?
) 
ORDER BY stream_sessionId DESC 
LIMIT 1;
    `,
      [userId]
    );

    // if (data.length > 0) {
    //   const result = data[0];
    //   const { hours, minutes, seconds } = convertDurationToTime(
    //     result.duration
    //   );
    //   result.formatted_duration = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;

    //   res.json({ success: true, data: data });
    // } else {
    //   res.status(404).json({ message: "No stream results found" });
    // }

    res.json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stream results", error });
  }
};

// function convertDurationToTime(duration: number): {
//   hours: number;
//   minutes: number;
//   seconds: number;
// } {
//   const hours = Math.floor(duration / 3600);
//   const minutes = Math.floor((duration % 3600) / 60);
//   const seconds = duration % 60;

//   return {
//     hours,
//     minutes,
//     seconds,
//   };
// }

export const getTotalStream = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  // console.log("userId", userId);
  // const userId = req.params.id;
  if (!userId) {
    return res.status(401).json({ message: "Error: No userId found" });
  }

  try {
    // Execute the SQL query to calculate the total duration for the user
    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      ` SELECT * 
    FROM stream_result 
    WHERE stream_sessionId IN (
        SELECT id 
        FROM stream_session 
        WHERE userId = ?
    ) 
    ORDER BY stream_sessionId DESC 
    LIMIT 1`,
      [userId]
    );

    // Access the total duration from the first row
    const totalDuration = rows[0]?.duration;
    // console.log("totalDuration", totalDuration);
    // Return the total duration as part of the JSON response
    res.json({ success: true, data: { totalDuration } });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stream results", error });
  }
};

export const getDetailStreamResult = async (req: Request, res: Response) => {
  const stream_sessionId = req.params.id;
  // console.log("streamId", stream_sessionId);
  if (!stream_sessionId) {
    return res
      .status(401)
      .json({ success: false, message: "Error: no stream_sessionId found" });
  }

  const [data] = await pool.query(
    `
      SELECT * FROM stream_result 
      WHERE id = ?
    `,
    [stream_sessionId]
  );
  res.json({ success: true, data });
};
