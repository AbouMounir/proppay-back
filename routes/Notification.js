import express from 'express';
import { createNotification, deleteNotification, getAllNotification, getPaymentLinkSendNotification, markNotificationAsRead } from '../controllers/Notification.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';
const routerNotification = express.Router();


routerNotification.get(('/'), getAllNotification)
routerNotification.get('/paymentLink',authMiddleware, getPaymentLinkSendNotification)
routerNotification.delete(('/delete/:id'), deleteNotification)
routerNotification.post(('/add'), createNotification)
routerNotification.put(('/as-read/:id'), markNotificationAsRead)


export default routerNotification