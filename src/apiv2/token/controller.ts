import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { Request, Response } from "express";
require("dotenv").config();

const APP_ID = process.env.APP_ID as string;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE as string;

export const access_token = (req: Request, res: Response) => {
  const { channelName, uid, role } = req.body;
  if (!channelName) {
    return res.status(400).json({ error: "channel name is required" });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return res.json({ token: token });
};

export const access_tokenview = (
  channelName: string,
  role: string,
  uid: number,
  expiry = 3600
) => {
  return (req: Request, res: Response) => {
    if (!channelName) {
      return res.status(400).json({ error: "Channel name is required" });
    }

    // Map role from string to number
    let roleNumber: number;
    if (role === "audience") {
      roleNumber = RtcRole.SUBSCRIBER; // Assuming audience is equivalent to SUBSCRIBER
    } else if (role === "publisher") {
      roleNumber = RtcRole.PUBLISHER; // Assuming publisher is equivalent to PUBLISHER
    } else {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expiry;

    try {
      console.log(
        `Generating token for channel: ${channelName}, uid: ${uid}, role: ${roleNumber}, expire: ${privilegeExpiredTs}`
      );
      const token = RtcTokenBuilder.buildTokenWithUid(
        process.env.APP_ID || "",
        process.env.APP_CERTIFICATE || "",
        channelName,
        uid,
        roleNumber,
        privilegeExpiredTs
      );
      console.log(`Generated token: ${token}`);
      return res.json({ token: token });
    } catch (error: any) {
      console.error("Error generating RTC token:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
