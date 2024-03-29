//npm install -g firebase-tools

import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import express from "express";
import { authMiddleware } from "./controllers/middleware/authMiddleware.js";
import connectDb from "./database/db.js";
import routerImage from "./routes/Image.js";
import routerNotification from "./routes/Notification.js";
import { default as routerLandlord, default as routerTenant } from "./routes/Proprietaire.js";
import routerPropriety from "./routes/Propriete.js";

const app = express();

/* const fruits = new Map([
    ["apples", 500],
    ["bananas", 300],
    ["oranges", 200]
  ]);
  fruits.clear();
  console.log(fruits); */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors("*"));

dotenv.config({ path: './config/.env' })
connectDb();

/* app.post('/landlords',upload.single('landlords'), (async (req, res) => {
    console.log(req.file);
    await uploadFileToFolder("landlords5",req.file.originalname)
    res.json({ fileUrl: req.file.location });
})); */
app.use('/',routerImage)
app.use('/users/tenants', routerTenant)
app.use('/users/landlords', routerLandlord)
app.use('/proprieties',authMiddleware, routerPropriety)
app.use('/notifications', authMiddleware, routerNotification)

app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("server is running on " + process.env.PORT);
})



