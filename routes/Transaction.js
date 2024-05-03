import express from 'express';
import { createTransaction, getLandlordTransactionsInfos, getTransactionInfo, getTransactionsInfos, getUploadLink, sendPaymentLink } from '../controllers/Transaction.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';
const routerTransaction = express.Router()

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
//routerTransaction.get('/:id', getPropriety)

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
//routerTransaction.get('/', getProprieties)

/**
 * @swagger
 *   /transactions/send:
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
routerTransaction.post('/send', sendPaymentLink)
routerTransaction.post('/send/factures', createTransaction)
routerTransaction.get('/info/:id',getTransactionInfo)
routerTransaction.get('/landlord/infos',authMiddleware, getLandlordTransactionsInfos)
routerTransaction.get('/infos',getTransactionsInfos)
routerTransaction.get('/upload/receipt/:id',getUploadLink)

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
//routerTransaction.delete('/:id', deletePropriety)
/* routerImage.get('/upload/:id',getImage) */


export default routerTransaction