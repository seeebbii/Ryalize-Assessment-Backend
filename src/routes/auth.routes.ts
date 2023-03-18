import express from 'express'
const authController = require('../controllers/auth/auth.controller');
import Token from "../service/token";

const router = express.Router();

router.get('/profile', Token.fetchProfile, authController.getAll);

router.post('/login', authController.login);
router.post('/register', authController.registerAccount);

router.post('/change-password', Token.verifyToken, authController.changePassword);

router.post('/verify', authController.verifyOtp);
router.post('/resend', authController.resendOtp);

export default router;