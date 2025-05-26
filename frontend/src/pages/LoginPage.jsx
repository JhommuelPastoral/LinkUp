import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api.js";
import { useState, useRef } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const socketRef = useRef(null);

  const [siginData, setSiginData] = useState({
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const { mutate: siginMutation, isPending: isLoginLoading } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success('Login successfully!');
      queryClient.invalidateQueries(["authUser"]);

    },
    onError: (error) => {
      toast.error(error)
    },
  });



  const handleSubmit = (e) => {
    e.preventDefault();
    siginMutation(siginData);
  };

  return (
    
    <div className="mx-auto max-w-[1000px] gap-4 h-screen flex justify-center items-center font-Poppins bg-base-300 md:bg-base-100">
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row bg-base-300 rounded-tr-xl rounded-br-xl">
        <div className="w-1/2  hidden md:block bg-[rgb(246,251,245)] rounded-tl-xl rounded-bl-xl">
          <img src="/Social.png" alt="" />
        </div>
        <div className="w-full md:w-1/2  flex flex-col items-center gap-4 p-[10px] ">
          <p className="text-3xl font-bold text-current"> Welcome Back </p>
          <p className="text-sm font-light text-center text-current">Wherever you dream of going, we make it easier to explore, connect, and experience the world like never before.</p>
          <form className="w-full px-2.5 space-y-4">
            <div className="flex flex-col">
              <label className="w-full input validator">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </g>
                </svg>
                <input value={siginData.email} type="email" placeholder="JohnDoe@gmail.com" onChange={(e) => setSiginData({ ...siginData, email: e.target.value })} required />
              </label>
              <div className="hidden validator-hint">Enter valid email address</div>      

            </div>

            <div className="flex flex-col ">
              <label className="w-full input">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                    ></path>
                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                  </g>
                </svg>
                <input
                  type="password"
                  required
                  onChange={(e) => setSiginData({ ...siginData, password: e.target.value })}
                  value={siginData.password}
                  placeholder="Password"

                />
              </label>


            </div>

            <button className="w-full btn btn-primary" onClick={handleSubmit} disabled={isLoginLoading}> {isLoginLoading  ?  <div className="flex gap-2.5 items-center"><span className="loading loading-spinner ">  </span> Signing in</div>    : "Sign in"}</button>
            <p className="text-sm text-center">Don't have an account? <Link className="font-semibold" to="/signup"> Sign up</Link> </p>

          </form>

        </div>

      </div>
    </div>
    
  )
  
}
