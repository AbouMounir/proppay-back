import express from 'express';
import { addPropriety, deletePropriety, getProprieties, getPropriety } from '../controllers/Propriete.js';
const routerPropriety = express.Router()

/**
 * @swagger
 * tags:
 *   name: Proprieties
 *   description: API to manage proprieties
 */

/**
 * @swagger
 *   /{id}:
 *     get:
 *       summary: Get a propriety by id
 *       tags: [Proprieties]
 *       responses:
 *         "200":
 *           description: The propriety
 */
routerPropriety.get('/:id', getPropriety)

/**
 * @swagger
 *   /:
 *     get:
 *       summary: Get all proprieties
 *       tags: [Proprieties]
 *       responses:
 *         "200":
 *           description: The list of proprieties
 */
routerPropriety.get('/', getProprieties)

/**
 * @swagger
 *   /add:
 *     post:
 *       summary: Add a propriety
 *       tags: [Proprieties]
 *       responses:
 *         "200":
 *           description: propriety added
 */
routerPropriety.post('/add', addPropriety)

/**
 * @swagger
 *   /{id}:
 *     delete:
 *       summary: Delete a propriety
 *       tags: [Proprieties]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a propriety
 */
routerPropriety.delete('/:id', deletePropriety)
/* routerImage.get('/upload/:id',getImage) */


export default routerPropriety