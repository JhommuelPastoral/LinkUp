import axiosInstance from "./axios.js";

export const  getAuthUser = async ()=>{

  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    console.log("getAuthUser", error.message);
    return null
  }
}

export const login = async (signinData)=>{
  try {
    const response = await axiosInstance.post("/auth/login",signinData );
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
}

export const signup = async (signupData)=>{
  try {
    console.log(signupData);
    const response = await axiosInstance.post("/auth/signup",signupData );
    
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
}

export const getRecommendUser = async ()=>{
  try {
    const response = await axiosInstance.get("/user");
    return response.data;
  } catch (error) {
    console.log("getRecommendUser", error.message);
    throw error.response.data.message;
  }
}

export const OnboardingData = async (onboardingData)=>{
  try {
    const response = await axiosInstance.post("/auth/onboarding",onboardingData );
    return response.data;
  } catch (error) {
    console.log("OnboardingData", error.message);
    throw error.response.data.message;
  }
}

export const logout = async ()=>{
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    return null
  }
}

export const getOnlineUsers = async ()=>{
  try {
    const response = await axiosInstance.get("/user/getonline");
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getPaginatedFriends = async ({pageParam})=>{
  try {
    const response = await axiosInstance.get(`/user/getPaginatedFriends?page=${pageParam}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const addFriend = async (id)=>{
  try {
    const response = await axiosInstance.post(`/user/addfriend/${id}`);
    return response.data;
  } catch (error) {
    console.log("addFriend Error:", error.message);
    throw  Error(error.response?.data?.message );
  }
}

export const getOutgoingFriendRequests = async ()=>{
  try {
    const response = await axiosInstance.get("/user/getOutgoingFriendRequests");
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}


export const getIncomingFriendRequests = async ({pageParam})=>{
  try {
    const response = await axiosInstance.get(`/user/getIncomingFriendRequests?page=${pageParam}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const acceptFriendRequest = async (id)=>{
  try {
    const response = await axiosInstance.post(`/user/acceptFriendRequest/${id}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getFriends = async ()=>{
  try {
    const response = await axiosInstance.get("/user/getfriends");
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const post = async (data)=>{
  try {
    const response = await axiosInstance.post("/user/createpost",data);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}


export const getPosts = async ({ pageParam}) => {
  try {
    const res = await axiosInstance.get(`/user/getposts?page=${pageParam}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch posts');
  }
};


export const getSingleRecommendeduser = async ({pageParam})=>{
  try {
    const response = await axiosInstance.get(`/user/recommended?page=${pageParam}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}


export const addLike = async (id)=>{
  try {
    const response = await axiosInstance.post(`/user/likepost/${id}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getSpecificPosts = async (id)=>{
  try {
    const response = await axiosInstance.get(`/user/getspecificpost/${id}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}


export const getAllUserPosts = async ()=>{
  try {
    const response = await axiosInstance.get(`/user/getuserposts`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const addComment = async (data)=>{
  try {
    const response = await axiosInstance.post(`/user/comment`,data);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const sendChat = async (data)=>{
  try {
    const response = await axiosInstance.post(`/user/sendchat`,data);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getChat = async (data) => {
  try {
    const response = await axiosInstance.get(
      `/user/getchat?userId=${data.senderId}&recepientId=${data.receiverId}`
    );
    return response.data;
  } catch (error) {
    throw Error(error.response?.data?.message || "Failed to fetch chat");
  }
};

export const createMyday = async (data)=>{
  try {
    const response = await axiosInstance.post(`/user/createmyday`,data);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getMyday = async ()=>{
  try {
    const response = await axiosInstance.get(`/user/getmyday`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getUserById = async (id)=>{
  try {
    const response = await axiosInstance.get(`/user/profile/${id}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const getUserPostById = async (id)=>{
  try {
    const response = await axiosInstance.get(`/user/getuserposts/${id}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const addCommentLike = async (data)=>{
  try {
    const response = await axiosInstance.post(`/user/commentlike`,data);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}

export const findUser = async ({fullname})=>{
  try {
    const response = await axiosInstance.get(`/user/finduser?fullname=${fullname}`);
    return response.data;
  } catch (error) {
    throw  Error(error.response?.data?.message );
  }
}