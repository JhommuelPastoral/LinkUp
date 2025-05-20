import { useEffect, useState, useRef } from 'react';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFriends, sendChat, getChat } from '../lib/api.js';
import { Send, X, ImagePlus } from 'lucide-react';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';

export default function MessagePage() {
  const { authData } = useAuthUser();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Query to get friends list
  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['friends', authData?.user?._id],
    queryFn: () => getFriends(authData?.user?._id),
    enabled: !!authData?.user?._id,
  });

  // Query to get chat messages
  const {
    data: chatMessagesData = { messages: [] },
    refetch: refetchChatMessages,
    isFetching: isLoadingMessages,
  } = useQuery({
    queryKey: ['chat', authData?.user?._id, selectedFriend?._id],
    queryFn: () =>
      getChat({
        senderId: authData?.user?._id,
        receiverId: selectedFriend?._id,
      }),
    enabled: !!authData?.user?._id && !!selectedFriend?._id,
  });

  // Mutation to send messages
  const { mutate: sendMessage } = useMutation({
    mutationFn: sendChat,
    onSuccess: () => {
      refetchChatMessages();
    },
  });

  useEffect(() => {
    if (!friendsData?.friends?.friends) return;
    setFriends(friendsData.friends.friends);
  }, [friendsData]);

  useEffect(() => {
    if (selectedFriend?._id) {
      refetchChatMessages();
    }
  }, [selectedFriend]);

  // Initialize socket only once
  useEffect(() => {
    if (!authData?.user?._id || socket.current) return;

    socket.current = io(backendUrl);

    socket.current.on(`newMessage${authData.user._id}`, () => {
      refetchChatMessages();
    });

    return () => {
      socket.current?.off(`newMessage${authData.user._id}`);
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [authData?.user?._id, backendUrl]);

  // Scroll to bottom when chat messages update and loading is done
  useEffect(() => {
    if (!isLoadingMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessagesData, isLoadingMessages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
  };

  const handleClickFriend = (friend) => {
    setSelectedFriend(friend);
  };

  const handleSendMessage = () => {
    if (!message && !imagePreview) return;
    if (!selectedFriend?._id || !authData?.user?._id) return;

    const newMessage = {
      senderId: authData.user._id,
      receiverId: selectedFriend._id,
      message,
      image: imagePreview,
      date: dayjs().format('YYYY-MM-DD, HH:mm:ss'),
    };

    sendMessage(newMessage);
    setMessage('');
    setImagePreview('');
  };

  if (!authData) {
    return (
      <div className="max-w-lg mx-auto gap-5 font-Poppins p-5 items-center flex justify-center min-h-screen skeleton bg-base-200">
        <span className="loading loading-dots loading-lg"></span>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen mx-auto flex font-Poppins gap-2.5 p-5">
      <div className={`w-64 space-y-5 h-[calc(100vh-40px)] ${isLoading ? 'skeleton' : ''}`}>
        <p className="text-lg font-semibold">Messages</p>
        {friends.map((friend) => (
          <div
            onClick={() => handleClickFriend(friend)}
            key={friend._id}
            className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors duration-200 ${
              selectedFriend?._id === friend._id ? 'bg-base-200' : 'hover:bg-base-300'
            }`}
          >
            <img
              className="w-12 h-12 rounded-full object-cover"
              src={friend.profileImage}
              alt={friend.fullname}
            />
            <p>{friend.fullname}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-[calc(100vh-40px)] space-y-2.5 bg-base-300 p-5 rounded-2xl">
        {!selectedFriend ? (
          <div className="flex items-center justify-center h-full">Select a friend</div>
        ) : (
          <>
            <div className="items-center flex gap-2.5">
              <img
                src={selectedFriend?.profileImage}
                alt={selectedFriend?.fullname}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="font-semibold">{selectedFriend?.fullname}</p>
            </div>

            {/* Messages */}
            <div
              className={`bg-base-100 rounded-2xl flex flex-col ${
                imagePreview ? 'h-[calc(100vh-300px)]' : 'h-[calc(100vh-230px)]'
              } overflow-y-auto p-2.5`}
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-dots loading-md"></span>
                </div>
              ) : chatMessagesData?.messages?.length > 0 ? (
                <>
                  {chatMessagesData.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat ${
                        msg.id === authData.user._id ? 'chat-end' : 'chat-start'
                      }`}
                    >
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img
                            alt="User avatar"
                            src={
                              msg.id === authData.user._id
                                ? authData.user.profileImage
                                : selectedFriend.profileImage
                            }
                          />
                        </div>
                      </div>
                      <div className="chat-header">
                        {msg.senderId === authData.user._id ? 'You' : selectedFriend.fullname}
                        <time className="text-xs opacity-50 ml-2">
                          {dayjs(msg.date).format('HH:mm')}
                        </time>
                      </div>
                      <div className="chat-bubble">
                        {msg.image && <img src={msg.image} className="h-20 mb-2" />}
                        {msg.text}
                      </div>
                      <div className="chat-footer opacity-50">Delivered</div>
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative w-20 h-20 mb-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={removeImagePreview}
                  className="absolute top-1 right-1 bg-gray-800 p-1 rounded-full text-white hover:bg-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex h-20 items-center justify-between gap-2.5">
                <textarea
                  className="textarea resize-none w-full border-none rounded-2xl"
                  placeholder="Send a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>

                <div className="flex gap-2">
                  <label htmlFor="image-upload" className="btn btn-circle">
                    <ImagePlus size={20} />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <button
                    className="btn btn-soft flex items-center gap-2"
                    onClick={handleSendMessage}
                  >
                    <Send />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
