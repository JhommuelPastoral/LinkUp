import { Loader } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="max-w-[1000px] mx-auto space-x-2.5 flex justify-center  items-center min-h-screen">
      <Loader className="animate-spin" /> 
      <p className='text-current font-semibold '> Fetching Some Data </p>
    </div>


  )
}
