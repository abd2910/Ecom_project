"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

function SignUpPage() {
  const signupSchema = z.object({
    username: z.string().min(4, "username is required"),
    email: z.string().email("Invalid Email Address"),
    password: z.string().min(8, "password must be 8+ character long"),
    phone: z.string().min(10, "phone number is required"),
    profile_image: z.file(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
  });

  // ... keep imports and schema

  const onSubmit = async (data) => {
    console.log("submit data:", data);

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);

    if (data.profile_image instanceof File) {
      formData.append("profile_image", data.profile_image);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/create",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log("response:", response.data);

      toast.success(response.data.message || "Signup successful!");

      reset();
    } catch (err) {
      console.error("upload error:", err.response ?? err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.email ||
        err.response?.data?.errors?.username ||
        "Something went wrong";

      toast.error(errorMessage);
    }
  };

  return (
    <div className="main-container mt-16 lg:mt-25  flex items-center justify-center   ">
      <div className="main-section">
        {/* Outer container */}
        <div className="w-full max-w-4xl   bg-white border-2 border-gray-300 rounded-xl p-5 sm:p-10 !pb-5 sm:!pt-10 sm:!pb-10 lg:p-20 !pt-5">
          <h3 className=" text-center !text-2xl sm:!text-3xl !font-bold mb-6 text-gray-800">
            Signup
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="">
              <Label htmlFor="username" className="text-gray-700 mb-2">
                Username
              </Label>
              <Input
                className=""
                id="username"
                placeholder="Enter your username"
                {...register("username", { required: true })}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <p className="text-red-500 !text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <p className="text-red-500 !text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-gray-700 mb-2">
                Phone
              </Label>
              <Input
                id="phone"
                type="number"
                placeholder="Enter your phone number"
                {...register("phone", { required: true })}
              />
              {errors.phone && (
                <p className="text-red-500 !text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="profile_image">Picture</Label>
              <Controller
                control={control}
                name="profile_image"
                defaultValue={null}
                render={({ field }) => (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      // pass the first File, not the FileList
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(file);
                    }}
                    ref={field.ref}
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4 text-white font-medium"
            >
              Sign up
            </Button>
            <p className="text-sm font-normal">
              Already have an account?{" "}
              <Link
                href={"/login"}
                className="pl-1 underline text-[#4D83FF] font-medium"
              >
                {" "}
                Login now
              </Link>{" "}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
