import express from "express";
import protectedRoute from "../middleware/auth.middleware.js";
import { getRecommendedFriends,addFriend, getOnlineUsers, getPaginatedFriends, getOutgoingFriendRequests,getIncomingFriendRequests, getSingleRecommendeduser, acceptFriendRequest,getFriends } from "../controllers/user.controllers.js";
import { post,getPosts, likePosts, getAllUserPosts} from "../controllers/post.controllers.js";
const userRoutes =  (io) => {
  
  const router = express.Router();
  router.use(protectedRoute)
  router.get("/",protectedRoute, (req, res) => getRecommendedFriends(req, res));
  router.get("/recommended",protectedRoute, (req, res) => getSingleRecommendeduser(req, res));
  router.post("/addfriend/:id",protectedRoute, (req, res) => addFriend(req, res,io));
  router.post("/acceptfriendrequest/:id",protectedRoute, (req, res) => acceptFriendRequest(req, res,io));
  router.get("/getfriends",protectedRoute, (req, res) => getFriends(req, res));
  router.get("/getPaginatedFriends",protectedRoute, (req, res) => getPaginatedFriends(req, res));
  router.get("/getonline",protectedRoute, (req, res) => getOnlineUsers(req, res, io));
  router.get("/getOutgoingFriendRequests",protectedRoute, (req, res) => getOutgoingFriendRequests(req, res, io ));
  router.get("/getIncomingFriendRequests",protectedRoute, (req, res) => getIncomingFriendRequests(req, res, io));

  // Post
  router.post("/createpost",protectedRoute, (req, res) => post(req, res,io));
  router.get("/getposts",protectedRoute, (req, res) => getPosts(req, res));
  router.post("/likepost/:id",protectedRoute, (req, res) => likePosts(req, res,io));
  router.get('/getuserposts',protectedRoute, (req, res) => getAllUserPosts(req, res));
  return router;

}

export default userRoutes;