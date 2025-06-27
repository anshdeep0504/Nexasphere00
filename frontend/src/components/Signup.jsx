import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axiosWithAuth from '../lib/axiosWithAuth';

const Signup = () => {
  const [input, setInput] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const api = axiosWithAuth();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          userName: "",
          email: "",
          password: "",
        });
      }
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={signupHandler}>
            <div>
              <Label htmlFor="userName">Username</Label>
              <Input
                id="userName"
                name="userName"
                value={input.userName}
                onChange={changeEventHandler}
                placeholder="Enter your username"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                placeholder="Enter your email"
                className="mt-1"
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
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
            {loading ? (
              <Button>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </Button>
            ) : (
              <Button className="mt-2" type="submit">
                Signup
              </Button> 
            )}
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline hover:opacity-90"
              >
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
