import express from 'express';
import { getNotifications } from '../controllers/notification.controllers.js';
import {isAuth, isOperator} from '../middlewares/isAuth.middlewares.js';

const router = express.Router();

// Protected route to fetch notifications
router.get('/', isAuth,isOperator, getNotifications);

export default router;
