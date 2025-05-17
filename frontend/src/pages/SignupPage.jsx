import {Link} from 'react-router'
import { useState } from 'react';
import {useMutation} from '@tanstack/react-query'
import {signup} from '../lib/api.js'
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
export default function SignupPage() {
  const queryClient = useQueryClient();
  const [signupData, setSignupData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const { mutate: signupMutation, isLoading: isSignupLoading} = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success('Signup successfully!');
      queryClient.invalidateQueries(["authUser"]);
      setSignupData({ fullname: "", email: "", password: "" });
    },
    onError: (error) => {
      toast.error(error)
    }
  })

  const handleSubmit = (e) => { 
    e.preventDefault();
    signupMutation(signupData);
  }
  return (
    <div className="mx-auto max-w-[1000px] gap-4 h-screen flex justify-center items-center font-Poppins bg-base-300 md:bg-base-100">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 bg-base-300 rounded-tr-xl rounded-br-xl">
        <div className="w-1/2  hidden md:block bg-[rgb(246,251,245)] rounded-tl-xl rounded-bl-xl">
          <img src="/SignUp.png" alt="" />
        </div>
        <div className="w-full md:w-1/2  flex flex-col  gap-4 p-[10px] ">
          <div className='p-[10px]'>
            <p className='text-current font-light text-sm'>START FOR FREE</p>
            <p className="text-current font-bold text-3xl">Create new account </p>
            <p className="text-sm">Already a member? <Link className="text-primary" to="/login"> Sign in</Link> </p>
          </div>
          <form className="w-full px-2.5 space-y-4">
            <div className='flex flex-col space-y-1'>
              <label className="input validator w-full">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </g>
                </svg>
                <input
                  type="text"
                  required
                  placeholder="Fullname"
                  pattern="^[A-Za-z ]+$"
                  minLength="3"
                  maxLength="30"
                  title="Only letters, numbers or dash"
                  className='w-full'
                  value={signupData.fullname}
                  onChange={(e) => setSignupData({ ...signupData, fullname: e.target.value })}
                />
              </label>
              <p className="validator-hint hidden">Must be 3 to 30 characters
                <br />containing only letters
              </p>
            </div>

            <div className="flex flex-col">
              <label className="input validator w-full">
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
                <input value={signupData.email} type="email" placeholder="JohnDoe@gmail.com" onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
              </label>
              <div className="validator-hint hidden">Enter valid email address</div>      

            </div>

            <div className="flex flex-col ">
              <label className="input validator w-full">
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
                  placeholder="Password"
                  minLength="8"
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  title="Must be more than 6 characters, including number, lowercase letter, uppercase letter"
                />
              </label>
              <p className="validator-hint hidden">
                Must be more than 6 characters, including
                <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
              </p>
            </div>

            <button className="btn btn-primary w-full" onClick={handleSubmit} >{isSignupLoading ? (<span className='loading loading-spinner'></span> ) : 'Sign Up'}</button>

          </form>

        </div>

      </div>
    </div>  )
}
