

import { User } from "../models/user.models.js";
import { asynchandler } from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadCloudnary } from "../utils/cloudnary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendEmail } from "../utils/sendEmail.js";




export const createUser = asynchandler(async (req, res) => {
  
  const { username, email, password,phone } = req.body;

  // ❌ profile_image shouldn't be checked here yet
  if (!username || !email || !password || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const checkUser = await User.findOne({ $or: [{ email }, { username }] });
  if (checkUser) {
    throw new ApiError(409, "Username or Email already exists");
  }

  // Multer upload check
  const profile_image_path = req.files?.profile_image?.[0]?.path;

  if (!profile_image_path) {
    throw new ApiError(400, "Profile image is required");
  }

  // Upload to Cloudinary
  const profile_image = await uploadCloudnary(profile_image_path);

  if (!profile_image || !profile_image.url) {
    throw new ApiError(400, "Profile image upload failed");
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    phone,
    profile_image: profile_image.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refresh_token"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new Apiresponse(200, createdUser, "User Created successfully"));
});

const genrateAccesstokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesstoken = await user.genrateAccesstoken();
    const refreshtoken = await user.genrateRefreshtoken();
    
    user.refresh_token = refreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };   // FIXED
  } catch (error) {
    throw new ApiError(500, "Something went wrong during token generation");
  }
};

export const loginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "email or uername is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User not found ");
  }
  const passwordValid = await user.isPasswordcorect(password);

  if (!passwordValid) {
    throw new ApiError(401, "Incorrect Password");
  }
  const { accesstoken, refreshtoken } = await genrateAccesstokenAndRefreshToken(
    user._id
  );
  const logedInUser = await User.findById(user._id).select(
    "-password -refresh_token"
  );
  const options = {
    httpOnly: true,
    secure: false,
  };
  return res.status(200).
  cookie("accesstoken", accesstoken, options).
  cookie("refreshtoken",refreshtoken,options)
  .json(new Apiresponse(200,{user:logedInUser,accesstoken,refreshtoken},"User login Successfully"))
});

export const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refresh_token: null } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new Apiresponse(200, {}, "Logout Successfully"));
});

export const refreshAccessToken=asynchandler(async(req,res)=>{
  try{

  
  const incomingRefreshToken=req.cookies.refreshtoken|| req.body.refreshtoken
  if(incomingRefreshToken){
    throw new ApiError(401,"Unauthorized Reaquest");

  }
  const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SSECRET);
 const user=await User.findById(decodedToken._id)
 if(!user){
  throw new ApiError(401,"Invalid refresh token");
 }
 if(incomingRefreshToken!==user?.refresh_token){
  throw new ApiError(401,"Refresh Token is expired or Used")
 }
   const options = {
    httpOnly: true,
    secure: false,
  };
 const {accesstoken,newrefreshtoken}= await genrateAccesstokenAndRefreshToken(user._id)
   return res
    .status(200)
    .clearCookie("accesstoken", accesstoken,options)
    .clearCookie("refreshtoken", newrefreshtokenrefreshtoken,options)
    .json(new Apiresponse(200, {accesstoken,refreshtoken:newrefreshtoken},"Acess token is refreshed" ));
  }
  catch(error){
    throw new ApiError(500,"Something went Wrong to genrate");

  }
})




export const forgotpassword = asynchandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

  const html = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetURL}" target="_blank">Reset Password</a>
    <p>This link expires in 10 minutes.</p>
  `;

  await sendEmail(email, "Password Reset Link", html);

  res
    .status(200)
    .json(new Apiresponse(200, {}, "Reset email sent to your inbox"));
});

export const resetPassword = asynchandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  

  

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
    console.log("hashedToken",hashedToken);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // ✔ bcrypt will hash this automatically in pre-save hook
  user.password = password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); // <-- bcrypt runs here

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Password reset successful"));
});



