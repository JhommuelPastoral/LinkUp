import { House, Search, Send, Compass, UserSearch, Users, UserPlus } from 'lucide-react';
import { useLocation, Link } from 'react-router';
import useAuthUser from '../hooks/useAuthUser.js';
import ThemeSelector from './ThemeSelector.jsx';
import { logout, getIncomingFriendRequests, getOutgoingFriendRequests, getRecommendUser, getFriends } from '../lib/api.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef, use } from 'react';
import { io } from 'socket.io-client';
const navLinks = [
  { to: '/home', label: 'Home', icon: <House size={20} /> },
  { to: '/search', label: 'Search', icon: <Search size={20} /> },
  { to: '/explore', label: 'Explore', icon: <Compass size={20} /> },
  { to: '/messages', label: 'Messages', icon: <Send size={20} /> },
  { to: '/explore/friends', label: 'Suggested Friends', icon: <UserSearch size={20} /> },
  { to: '/friends', label: 'Friends', icon: <Users size={20} /> },
  { to: '/requested/friends', label: 'Friend Requests', icon: <UserPlus size={20} /> },
];

export default function SideBar() {
  const { authData } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const socket = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [filterRecommendAcc, setFilterRecommendAcc ] = useState([]);
  const [badgeCounts, setBadgeCounts] = useState({
    'Friend Requests': 0,
    'Suggested Friends': 0,
    'Friends': 0,
  });

  const {data: getOutgoingFriend=[], refetch: outGoingFriendRequestsRefetch} = useQuery({
    queryKey: ['outgoingFriendRequests'],
    queryFn: getOutgoingFriendRequests
  });

  const {data: getIncomingFriend=[], refetch: incomingFriendRequestsRefetch} = useQuery({
    queryKey: ['incomingFriendRequests'],
    queryFn: getIncomingFriendRequests
  });

  const {data: recommendAcc=[], refetch: recommendUserRefetch} = useQuery({
    queryKey: ['recommendUser'],
    queryFn: getRecommendUser
  });

  const {data: userFriends=[], refetch: userFriendsRefetch} = useQuery({
    queryKey: ['friends'],
    queryFn: getFriends
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    if(!authData?.user) return;
    socket.current = io(backendUrl);
    socket.current.on(`outgoingFriendRequests${authData?.user?._id.toString()}`, () => {
      outGoingFriendRequestsRefetch();
    });
    socket.current.on(`incomingFriendRequests${authData?.user?._id.toString()}`, () => {
      incomingFriendRequestsRefetch();
    });
    socket.current.on("getRecommendedFriends", () => {
      recommendUserRefetch();
    });
    socket.current.on(`acceptedFriendRequest${authData?.user?._id.toString()}`, () => {
      userFriendsRefetch();
    });
    const outgoingFriendRequests = getOutgoingFriend?.outgoingFriendRequests?.map((req) => req.reciptient?._id);
    const incomingFriendRequests = getIncomingFriend?.incomingFriendRequests?.map((req) => req.sender?._id);
    const filterAcc = recommendAcc?.recommendUser?.filter((acc) => !outgoingFriendRequests?.includes(acc?._id) && !incomingFriendRequests?.includes(acc?._id));
    setFilterRecommendAcc(filterAcc);
    
    setBadgeCounts({
      'Friend Requests': incomingFriendRequests?.length,
      'Suggested Friends': filterAcc?.length,
      'Friends': userFriends?.friends?.friends?.length
    })
    return () => {
      socket.current.off(`outgoingFriendRequests${authData?.user?._id.toString()}`);
      socket.current.off(`incomingFriendRequests${authData?.user?._id.toString()}`);
      socket.current.disconnect();
    };


  }, [getOutgoingFriend, getIncomingFriend, recommendAcc, userFriends]);


  const handleLogout = () => {
    logoutMutation();
  };


  return (
    <aside className="h-full p-5 flex flex-col gap-6 rounded-r-2xl w-60">
      {/* Branding */}
      <div className="text-xl font-bold tracking-tight ">
        <Link to="/home">LinkUp</Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3">
        {navLinks.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 justify-between rounded-lg transition-colors duration-200 ${
              currentPath === to
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-200'
            }`}
          >    
          <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
          </div>
          {badgeCounts[label] > 0 && (
            <span
              className={`text-xs text-white rounded-full px-2 py-0.5 bg-error`}
            >
              {badgeCounts[label]}
            </span>
          )}

          </Link>
        ))}

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
            currentPath === '/profile'
              ? 'bg-primary text-primary-content'
              : 'hover:bg-base-200'
          }`}
        >
          <img
            src={authData?.user?.profileImage || '/default-avatar.png'}
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span>Profile</span>
        </Link>

        {/* Theme Selector */}
        <ThemeSelector className="mt-4" />
      </nav>

      {/* Footer */}
      <footer className="mt-auto text-xs text-base-content/60 w-full flex flex-col gap-5">
        <button
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg transition-colors duration-200 btn"
          onClick={handleLogout}
        >
          Log out
        </button>
        <p>&copy; 2025 LinkUp</p>
      </footer>
    </aside>
  );
}
