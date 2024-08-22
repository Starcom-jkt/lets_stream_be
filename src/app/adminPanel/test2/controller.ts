import { Request, Response } from "express";

export const index = async (req: Request, res: Response) => {
  try {
    res.render("admin/test2/index", {});
  } catch (err: any) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
