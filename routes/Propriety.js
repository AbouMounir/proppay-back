import express from 'express';
import { addPropriety, deletePropriety, getProprieties, getPropriety, updatePropriety } from '../controllers/Propriety.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';
const routerPropriety = express.Router()

/**
 * @swagger
 * tags:
 *   name: Proprieties
 *   description: API to manage proprieties
 */

/**
 * @swagger
 *   /proprieties/{id}:
 *     get:
 *       summary: Get a propriety by id
 *       tags: [Proprieties]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a property
 *       responses:
 *         "200":
 *           description: The propriety
 */
routerPropriety.get('/:id', getPropriety)

/**
 * @swagger
 *   /proprieties:
 *     get:
 *       summary: Get all proprieties
 *       tags: [Proprieties]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *       responses:
 *         "200":
 *           description: The list of proprieties
 */
routerPropriety.get('/', getProprieties)

/**
 * @swagger
 *   /proprieties/add:
 *     post:
 *       summary: Add a propriety
 *       tags: [Proprieties]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *       responses:
 *         "200":
 *           description: propriety added
 */
routerPropriety.post('/add', authMiddleware , addPropriety)

routerPropriety.put('/:id', updatePropriety);

/**
 * @swagger
 *   /proprieties/{id}:
 *     delete:
 *       summary: Delete a propriety
 *       tags: [Proprieties]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a propriety
 */
routerPropriety.delete('/:id', authMiddleware, deletePropriety)
/* routerImage.get('/upload/:id',getImage) */


export default routerPropriety