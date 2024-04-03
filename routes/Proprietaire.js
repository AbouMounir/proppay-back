import express from 'express';
const routerLandlord = express.Router()

import {
    addTenant,
    confirmLandlordPassword,
    deleteLandlord,
    deleteTenant,
    getLandlord,
    getLandlordProprieties,
    getLandlordTenants,
    getLandlords,
    getPhotoProfil,
    sendAuthOTP,
    signinLandlord,
    signupLandlord,
    updateLandlordPassword,
    updateProfil,
    updateProfilImage,
    verifyAuthOTP
} from '../controllers/Proprietaire.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Landlords
 *   description: API to manage landlords
 */

/**
 * @swagger
 *   /:
 *     get:
 *       summary: Get all Landlords
 *       tags: [Landlords]
 *       responses:
 *         "200":
 *           description: The list of Landlords
 */
routerLandlord.get('/',authMiddleware, getLandlords)

/** 
 * @swagger
 *   /{id}:
 *     get:
 *       summary: Get a landlord by id
 *       tags: [Landlords]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord
 */
routerLandlord.get('/:id',authMiddleware, getLandlord)

/** 
 * @swagger
 *   /photo-profil/{id}:
 *     get:
 *       summary: Get a landlord photo profile by id
 *       tags: [Landlords]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord photo profile
 */
routerLandlord.get('/photo-profil/:id', getPhotoProfil)

/** 
 * @swagger
 *   /proprieties/{id}:
 *     get:
 *       summary: Get a landlord proprieties by id
 *       tags: [Landlords]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord proprieties
 */
routerLandlord.get('/proprieties/:id',authMiddleware, getLandlordProprieties)

/** 
 * @swagger
 *   /tenants/{id}:
 *     get:
 *       summary: Get a landlord tenants by id
 *       tags: [Landlords]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord tenants
 */
routerLandlord.get('/tenants/:id',authMiddleware, getLandlordTenants)

/**
 * @swagger
 *   /signup:
 *     post:
 *       summary: sign up a landlord
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *       responses:
 *         "200":
 *           description: landlord sign up successfully
 */
routerLandlord.post('/signup', signupLandlord)

/**
 * @swagger
 *   /signin:
 *     post:
 *       summary: sign in a landlord
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *       responses:
 *         "200":
 *           description: landlord sign in successfully
 */
routerLandlord.post('/signin', signinLandlord)

/**
 * @swagger
 *   /signin:
 *     post:
 *       summary: sign in a landlord
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *       responses:
 *         "200":
 *           description: landlord sign in successfully
 */
routerLandlord.post('/confirm/password/:landlordNumber',authMiddleware, confirmLandlordPassword)

/**
 * @swagger
 *   /otp/send:
 *     post:
 *       summary: send otp for authentification
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *       responses:
 *         "200":
 *           description: otp send successfully
 */
routerLandlord.post('/otp/send',sendAuthOTP)

/**
 * @swagger
 *   /otp/verify:
 *     post:
 *       summary: authentificate otp sended
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *       responses:
 *         "200":
 *           description: authentification successfully
 */
routerLandlord.post('/otp/verify', verifyAuthOTP)

routerLandlord.put('/add-tenant', addTenant)
/* routerLandlord.put('/:_id',authMiddleware, updateLandlordNumber) */
routerLandlord.put(('/update-password/:landlordNumber'),authMiddleware, updateLandlordPassword)
routerLandlord.put(('/update-profil'),authMiddleware, updateProfil)
routerLandlord.put(('/photo-profil'),authMiddleware, updateProfilImage)

routerLandlord.delete('/:landlordNumber',authMiddleware, deleteLandlord)
routerLandlord.delete('/delete-tenant/:id', deleteTenant)


export default routerLandlord