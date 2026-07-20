import jwt from "jsonwebtoken";

import { asynchandler } from "../utlis/Asynchandler.js";
import { user } from "../models/user.model.js";

export const verifyJwt = asynchandler(async (req, res, next) => {
  console.log("req.cookie", req.cookie);
  console.log("req.header", req.header("Authorization"));
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("token", token);
    if (!token) {
      return res
        .status(401)
        .json({ status: 401, message: "Unauthorized request" });
    }
    const decode = jwt.verify(token, process.env.Access_Token_Secret);
    console.log("decode", decode);
    const users = await user
      .findById(decode?._id)
      .select("-password -refreshtoken");
    if (!users) {
      return res
        .status(401)
        .json({ status: 401, message: "invalid Accestoken" });
    }
    req.user = users;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});
