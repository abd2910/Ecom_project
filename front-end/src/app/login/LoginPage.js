"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from "sonner";

function LoginPage() {

    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/users/login",
        data,
        { withCredentials: true }
      );

      console.log("LOGIN RESPONSE:", res.data);

      // success toast
      toast.success(res.data.message || "Login successful!");

      // you can redirect here
      // router.push("/dashboard");

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      const backendError =
        err.response?.data?.message ||
        err.response?.data?.errors?.email ||
        err.response?.data?.errors?.password ||
        "Invalid credentials";

      // error toast
      toast.error(backendError);
    }
  };

    
  

  
  return (
        <div className="main-container mt-25 lg:mt-25  flex items-center justify-center   ">
      <div className="main-section ">
        {/* Outer container */}
        <div className="w-full   max-w-4xl    bg-white border-2 border-gray-300 rounded-xl p-5 sm:p-10 !pb-10 lg:p-20 !pt-10">
          <h3 className=" text-center !text-2xl sm:!text-3xl !font-bold mb-6 text-gray-800">
            Login
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <Link href={"/forgot"} className='text-blue-500 !text-sm mt-1'>forgot password</Link>
                 {errors.password && (
                   <p className="text-red-500 !text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4 hero-button rounded-md"
            >
              Login
            </Button>
            <p className="text-sm ">
              Don&apos;t have an account?
              <Link
                className=" pl-1 underline text-[#4D83FF] font-medium"
                href={"/signup"}
              >
                {" "}
                Sign up
              </Link>{" "}
            </p>


          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage