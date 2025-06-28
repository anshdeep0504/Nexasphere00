import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/Slices/authSlice.js";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginType, setLoginType] = useState("user");

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`,
        input
      );
      localStorage.setItem("token", response.data.token);
      dispatch(setAuthUser(response.data.user));
      navigate("/");
      toast.success(response.data.message);
      setInput({
        email: "",
        password: "",
      });
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-gray-800 bg-black text-white">
        <CardHeader>
          <div className="flex flex-col items-center mb-4">
            {/* 🌈 Rainbow Gradient N Logo */}
            <div className="text-5xl font-extrabold mb-2 tracking-wider">
              <span className="bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                N
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <Button
              type="button"
              variant={loginType === "user" ? "default" : "outline"}
              className={
                loginType === "user"
                  ? "bg-black text-white border border-gray-700"
                  : "bg-transparent text-white border border-gray-700"
              }
              onClick={() => setLoginType("user")}
            >
              User
            </Button>
            <Button
              type="button"
              variant={loginType === "admin" ? "default" : "outline"}
              className={
                loginType === "admin"
                  ? "bg-black text-white border border-gray-700"
                  : "bg-transparent text-white border border-gray-700"
              }
              onClick={() => setLoginType("admin")}
            >
              Admin
            </Button>
          </div>
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            {loginType === "admin" ? "Admin Login" : "User Login"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                placeholder={
                  loginType === "admin" ? "Enter admin email" : "Enter your email"
                }
                className="bg-zinc-900 mt-1 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                placeholder={
                  loginType === "admin"
                    ? "Enter admin password"
                    : "Enter your password"
                }
                className="bg-zinc-900 mt-1 text-white"
              />
            </div>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </Button>
            ) : (
              <Button className="mt-2 bg-gray-300 text-black" type="submit">
                Login
              </Button>
            )}
            <p className="text-sm text-center text-gray-400">
              Create an Account?{" "}
              <Link
                to="/signup"
                className="text-blue-500 hover:underline hover:opacity-90"
              >
                SignUp
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
