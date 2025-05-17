import express from 'express'
import {signup,login,logout, onboarding} from '../controllers/auth.controllers.js'
import protectedRoute from '../middleware/auth.middleware.js'

const authRoutes = (io) => {
  const router = express.Router();
    
  router.post('/login', (req,res)=> login(req,res));
  router.post('/signup', (req,res) => signup (req,res));
  router.post('/logout',(req,res) => logout(req,res, io));
  router.post('/onboarding', protectedRoute, (req,res)=> onboarding(req,res,io));
  router.get('/me', protectedRoute, (req,res) => {res.status(200).json({user: req.user})});
  return router;


};





export default authRoutes;