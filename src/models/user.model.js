import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userschema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // avatar: {
    //   type: String,
    //   required: true,
    // },
    // coverImage: {
    //   type: String,
    // },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
    },
    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userschema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userschema.methods.isPasswordCorrect = async function (password) {
  console.log("this.password", this.password);
  console.log("password", password);

  return await bcrypt.compare(password, this.password);
};

userschema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.Access_Token_Secret,
    { expiresIn: process.env.Access_Token_Expiry }
  );
};

userschema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.Refresh_Token_Secret,
    { expiresIn: process.env.Refresh_Token_Expiry }
  );
};

export const user = mongoose.model("User", userschema);
