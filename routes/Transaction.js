import express from 'express';
import { createTransaction, finalizeTransaction, getLandlordTransactionsInfos, getTransactionInfo, getTransactionsInfos, getUploadLink, getoutTransaction, sendPaymentLink } from '../controllers/Transaction.js';
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
routerTransaction.post('/payment/rent', createTransaction)
routerTransaction.post('/payment/finalize', finalizeTransaction)
routerTransaction.post('/payment/getout',authMiddleware,getoutTransaction)
routerTransaction.get('/info/:id',getTransactionInfo)
routerTransaction.get('/landlord/infos',authMiddleware, getLandlordTransactionsInfos)
routerTransaction.get('/infos',getTransactionsInfos)
routerTransaction.get('/upload/receipt/:id',getUploadLink)
//routerTransaction.post('/shorten',shortenUrl)
//routerTransaction.get('/:shortUrl',redirectToOriginalUrl)
routerTransaction.post('/shorten', async (req, res) => {
    const longUrl = req.body.longUrl;
    try {
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.shorturl) {
                res.json({ shortUrl: data.shorturl });
            } else {
                throw new Error('Impossible de raccourcir le lien');
            }
        } else {
            throw new Error('Erreur lors du raccourcissement du lien');
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors du traitement de votre demande' });
    }
});

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