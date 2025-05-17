import PostCard from '../components/PostCard.jsx';
import CreatePost from '../components/CreatePost.jsx';
export default function HomePage() {


  return (
    <div className='max-w-[800px] mx-auto min-h-screen space-y-5 p-5 font-Poppins'>
      {/* Create Post */}
      <CreatePost />

      {/* My Day */}
      <div className='w-[90%]  h-[80px]  mx-auto flex justify-center items-center '>
        <p>Still Working On Myday Features</p>
      </div>

      {/* Post Card */}
      <div className='max-w-[600px] mx-auto '>
        <PostCard />
      </div>

    </div>
  )
}
