import { asynchandler } from "../utlis/Asynchandler.js";
import { ApiError } from "../utlis/Apierror.js";
import { user } from "../models/user.model.js";
import { ApiResponse } from "../utlis/Apiresponce.js";

const registerUser = asynchandler(async (req, res) => {
  console.log("req.body", req.body);
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field.trim() === " ")
  ) {
    throw new ApiError(400, "All field are required");
  }
  const existingUser = user.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "user with email or username");
  }
  // const avatralocalpath=req.files?avatar[0]?avatralocal?path;

  // const coverImageLocalPath=req.files?coverImage[0]?path;

  user.create({ fullname, email, username, password });

  const createduser = await user
    .findById(user._id)
    .select("-password -refreshtoken");
  if (!createduser) {
    throw new ApiError(500, "usomething went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "user registered successfully"));
});

export { registerUser };
