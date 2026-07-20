import { asynchandler } from "../utlis/Asynchandler.js";
import { ApiError } from "../utlis/Apierror.js";
import { user } from "../models/user.model.js";
import { ApiResponse } from "../utlis/Apiresponce.js";
import jwt from "jsonwebtoken";

const registerUser = asynchandler(async (req, res) => {
  console.log("req.body", req.body);
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }
  console.log("username", username);
  const existingUser = await user.findOne({
    $or: [{ username }, { email }],
  });
  console.log("existingUser", existingUser);
  if (existingUser) {
    res.status(409).json({ meassge: "user with email or username" });
  }
  // const avatralocalpath=req.files?avatar[0]?avatralocal?path;

  // const coverImageLocalPath=req.files?coverImage[0]?path;

  const userDoc = await user.create({ fullname, email, username, password });
  console.log("user created successfully");

  const createduser = await user
    .findById(userDoc._id)
    .select("-password -refreshtoken");
  if (!createduser) {
    res
      .status(500)
      .json({ meassge: "usomething went wrong while registering the user" });

    //    throw new ApiError(500, "");
  }

  // return res
  //   .status(201)
  //   .json(new ApiResponse(200, createduser, "user registered successfully"));
  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "user registered successfully"));
});

const generateAccessRefreshToken = async (userId) => {
  try {
    console.log("asssceeuserId", userId);
    const users = await user.findById(userId);
    console.log("users", users);
    const accessToken = await users.generateAccessToken();
    const refreshToken = await users.generateRefreshToken();
    users.refreshtoken = refreshToken;
    await users.save({ validateBeforeSave: false });
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    // return res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = asynchandler(async (req, res) => {
  const { email, username, password } = req.body;

  // if (!email || !username) {
  //   res.status(400).json({ message: "username or Email not found" });
  // }

  const users = await user.findOne({ $or: [{ username }, { email }] });

  if (!users) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await users.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid user credentials" });
  }
  console.log("userslogin", users);
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    users._id
  );

  const loggedUserInUser = await user
    .findById(users._id)
    .select("-password -refreshtoken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      status: 200,
      user: loggedUserInUser,
      accessToken,
      refreshToken,
      message: "User logged in successfully",
    });
});

const logoutUser = asynchandler(async (req, res) => {
  console.log("req.user", req.user);
  user.findByIdAndUpdate(req.user._id, {
    $set: { refreshtoken: undefined, new: true },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accssToken", options)
    .clearCookie("refreshToken", options)
    .json({
      status: 200,
      message: "User logged out",
    });
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      message: "Unauthorized request",
    });
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.Refresh_Token_Secret
  );

  const users = await user.findById(decoded._id);

  if (!users) {
    return res.status(401).json({
      message: "User not found",
    });
  }

  if (incomingRefreshToken !== users.refreshtoken) {
    return res.status(401).json({
      message: "Refresh token is expired or invalid",
    });
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    users._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  const loggedUserInUser = await user
    .findById(users._id)
    .select("-password -refreshtoken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      status: 200,
      user: loggedUserInUser,
      accessToken,
      refreshToken,
      message: "New access token generated successfully",
    });
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
