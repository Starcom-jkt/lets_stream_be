import { Request, Response } from "express";
import {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} from "agora-access-token";
import dotenv from "dotenv";

dotenv.config();

const appID = process.env.APP_ID as string;
const appCertificate = process.env.APP_CERTIFICATE as string;

if (!appID || !appCertificate) {
  console.error(
    "FATAL ERROR: ENV not properly configured, check appID and appCertificate"
  );
  process.exit(1);
}

export const testRoutes = (req: Request, res: Response): void => {
  res.json({ success: true });
};

export const getRtcToken = (req: Request, res: Response): void => {
  const { channelName, role, tokentype, uid } = req.params;
  const expireTime = parseInt(req.query.expiry as string) || 3600;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + expireTime;

  try {
    let token: string;

    if (tokentype === "userAccount") {
      token = RtcTokenBuilder.buildTokenWithAccount(
        appID,
        appCertificate,
        channelName,
        uid,
        getRole(role),
        expireTimestamp
      );
    } else if (tokentype === "uid") {
      token = RtcTokenBuilder.buildTokenWithUid(
        appID,
        appCertificate,
        channelName,
        parseInt(uid, 10),
        getRole(role),
        expireTimestamp
      );
    } else {
      throw new Error(`Unknown tokentype: ${tokentype}`);
    }
    res.json({ rtcToken: token });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: `Error Generating RTC token: ${err.message}`,
      status: 400,
    });
  }
};

export const getRtmToken = (req: Request, res: Response): void => {
  const { uid } = req.params;
  const expireTime = parseInt(req.query.expiry as string) || 3600;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + expireTime;

  try {
    const token = RtmTokenBuilder.buildToken(
      appID,
      appCertificate,
      uid,
      RtmRole.Rtm_User,
      expireTimestamp
    );
    res.json({ rtmToken: token });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: `Error Generating RTM token: ${err.message}`,
      status: 400,
    });
  }
};

export const getBothTokens = (req: Request, res: Response): void => {
  const { channelName, role, tokentype, uid } = req.params;
  const expireTime = parseInt(req.query.expiry as string) || 3600;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + expireTime;

  try {
    let rtcToken: string;

    if (tokentype === "userAccount") {
      rtcToken = RtcTokenBuilder.buildTokenWithAccount(
        appID,
        appCertificate,
        channelName,
        uid,
        getRole(role),
        expireTimestamp
      );
    } else if (tokentype === "uid") {
      rtcToken = RtcTokenBuilder.buildTokenWithUid(
        appID,
        appCertificate,
        channelName,
        parseInt(uid, 10),
        getRole(role),
        expireTimestamp
      );
    } else {
      throw new Error(`Unknown tokentype: ${tokentype}`);
    }

    const rtmToken = RtmTokenBuilder.buildToken(
      appID,
      appCertificate,
      uid,
      RtmRole.Rtm_User,
      expireTimestamp
    );

    res.json({ rtcToken, rtmToken });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: `Error Generating Token: ${err.message}`,
      status: 400,
    });
  }
};

const APP_ID = process.env.APP_ID || "";
const APP_CERTIFICATE = process.env.APP_CERTIFICATE || "";
const expirationTimeInSeconds = 3600;

// Function to map role string to RtcRole
const getRole = (role: string) => {
  if (role === "publisher") {
    return RtcRole.PUBLISHER;
  } else {
    return RtcRole.SUBSCRIBER;
  }
};

export const generateRtcToken = (
  channelName: string,
  uid: string,
  expiry = 3600
) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + expiry;

  try {
    console.log(
      `Generating token for channel: ${channelName}, uid: ${uid}, expire: ${expireTimestamp}`
    );
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      parseInt(uid, 10),
      RtcRole.SUBSCRIBER,
      expireTimestamp
    );
    console.log(`Generated token: ${token}`);
    return token;
  } catch (error: any) {
    console.error("Error generating RTC token:", error.message);
    throw error;
  }
};
export const generateRtcTokenView = (
  channelName: string,
  uid: string,
  expiry = 3600
) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + expiry;

  try {
    console.log(
      `Generating token for channel: ${channelName}, uid: ${uid}, expire: ${expireTimestamp}`
    );
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID!,
      APP_CERTIFICATE!,
      channelName,
      parseInt(uid, 10),
      RtcRole.SUBSCRIBER,
      expireTimestamp
    );
    console.log(`Generated token: ${token}`);
    return token;
  } catch (error: any) {
    console.error("Error generating RTC token:", error.message);
    throw error;
  }
};
