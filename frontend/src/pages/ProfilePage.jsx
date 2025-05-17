import useAuthUser from "../hooks/useAuthUser.js";
import Profile from "../components/Profile.jsx";
export default function ProfilePage() {
  const { authData } = useAuthUser();
  

  if(!authData){
    return(
      <div className="max-w-[1000px] mx-auto  gap-5 font-Poppins p-5 items-center flex justify-center min-h-screen skeleton bg-base-200">
        <span className="loading loading-dots loading-lg"></span>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto  font-Poppins p-5">
      <Profile authData={authData}/>
    </div>
  )
}
