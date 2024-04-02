import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { authMiddleware } from "./controllers/middleware/authMiddleware.js";
import connectDb from "./database/db.js";
import routerImage from "./routes/Image.js";
import routerNotification from "./routes/Notification.js";
import { default as routerLandlord, default as routerTenant } from "./routes/Proprietaire.js";
import routerPropriety from "./routes/Propriete.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors("*"));

dotenv.config({ path: './config/.env' })
connectDb();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get example data
 *     description: Retrieve example data from the server
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Example data retrieved successfully
 */
app.get('/books', (req,res) => {
    res.send([{
        id: 1,
        title: "la chèvre de ma mère",
        author: "Ricardo"
    }])
})

app.use('/', routerImage)
app.use('/users/tenants', routerTenant)
app.use('/users/landlords', routerLandlord)
app.use('/proprieties', authMiddleware, routerPropriety)
app.use('/notifications', authMiddleware, routerNotification)

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Propay API Documentation',
            version: '1.0.0',
            description: 'Documentation for your API'
        },
        
    },
    apis: ['./*.js'], // Chemin vers les fichiers contenant les commentaires Swagger
};

const specs = swaggerJSDoc(options);

app.use('/api-docs', serve, setup(specs));

app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("server is running on " + process.env.PORT);
})



