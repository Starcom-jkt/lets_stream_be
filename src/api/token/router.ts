import { Router } from "express";
import { getRtcToken } from "./controller";

const router = Router();

router.get("/rtc/:channelName/:role/:tokentype/:uid", getRtcToken);
// router.get("/rtm/:uid", getRtmToken);
// router.get("/rte/:channelName/:role/:tokentype/:uid", getBothTokens);
// router.get("/rte/:channelName/:role/:tokentype/:uid", getBothTokens);

// router.get("/", testRoutes);
export default router;
