import PostCard from '../components/PostCard.jsx';
import useAuthUser from '../hooks/useAuthUser.js';
import CreatePost from '../components/CreatePost.jsx';
import Myday from '../components/Myday.jsx';
export default function HomePage() {

  return (
    <div className='max-w-[800px] mx-auto min-h-screen space-y-5 p-5 font-Poppins'>
      {/* Create Post */}
      <CreatePost />

      {/* My Day */}
      <Myday />

      {/* Post Card */}
      <div className='max-w-[600px] mx-auto '>
        <PostCard />
      </div>

    </div>
  )
}
