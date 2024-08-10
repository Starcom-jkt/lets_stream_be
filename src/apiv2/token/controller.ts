import { RtcTokenBuilder } from "agora-access-token";
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
