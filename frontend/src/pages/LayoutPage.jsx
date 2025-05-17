import SideBar from '../components/SideBar.jsx';
import RightSideBar from '../components/RightSidebar.jsx';
import DockerBar from '../components/DockerBar.jsx';

export default function LayoutPage({children}) {
  return (
    <>
      <div className="flex min-h-screen">
        <div className="hidden lg:block sticky top-0 h-screen w-[300px]">
          <SideBar />
        </div>
        <main className="flex-1">
          {children}
        </main>
        <div className="hidden lg:block sticky top-0 right-10 h-screen w-[300px]">
          <RightSideBar />
        </div>
      </div>
    </>
  )
}
