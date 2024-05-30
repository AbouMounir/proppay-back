import express from 'express';
const routerLandlord = express.Router()

import {
    addTenant,
    confirmLandlordPassword,
    confirmSignupLandlord,
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
    verifyAuthOTP,
    verifyLandloardNumber
} from '../controllers/Landlord.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';

// Schema des différents models
/**
 * @swagger
 * components:
 *   schemas:
 *     Landlord:
 *       type: object
 *       required:
 *         - landlordNumber
 *         - landlordFirstname
 *         - landlordLastname
 *       properties:
 *         id:
 *           type: Integer
 *           description: The auto-generated id of the user
 *         landlordNumber:
 *           type: string
 *           description: The number of the User
 *         landlordFirstname:
 *           type: string
 *           description: The firstname of the User
 *         landlordLastname:
 *           type: string
 *           description: The lastname of the User
 *         status:
 *           type: string
 *           description: The status of the User "inscrit or not"
 *         landlordAdress:
 *           type: string
 *           description: The landlordAdress of the User
 *         landlordPassword:
 *           type: string
 *           description: The landlordPassword of the User
 *         profilImage:
 *           type: string
 *           description: The profilImage url reference of the User
 *         identity:
 *           type: string
 *           description: The User identity paper
 *         listOfTenants:
 *           type: array
 *           items:
 *             type: object
 *         listOfProprieties:
 *           type: array
 *           items:
 *             type: string
 *     Tenant:
 *         type: object
 *         required:
 *           - tenantNumber
 *           - tenantFirstname
 *           - tenantLastname
 *         properties:
 *           id:
 *             type: Integer
 *             description: The auto-generated id of the user
 *           tenantNumber:
 *             type: string
 *             description: The number of the User
 *           tenantFirstname:
 *             type: string
 *             description: The firstname of the User
 *           tenantLastname:
 *             type: string
 *             description: The lastname of the User
 *           appartementNumber:
 *             type: string
 *             description: The status of the User "inscrit or not"
 *           tenantRent:
 *             type: string
 *             description: The landlordAdress of the User
 *           tenantPassword:
 *             type: string
 *             description: The landlordPassword of the User
 *           urlImage:
 *             type: string
 *             description: The profilImage url reference of the User
 *           identity:
 *             type: string
 *             description: The User identity paper
 *           appartementType:
 *             type: string
 *           tenantAdress:
 *             type: string
 *     Property:
 *         type: object
 *         required:
 *           - proprietyName
 *           - proprietyAdress
 *           - proprietyType
 *           - proprietyOccupation
 *         properties:
 *           id:
 *             type: Integer
 *             description: The auto-generated id of the user
 *           proprietyName:
 *             type: string
 *             description: The number of the User
 *           proprietyAdress:
 *             type: string
 *             description: The firstname of the User
 *           proprietyType:
 *             type: string
 *             description: The lastname of the User
 *           appartementNumber:
 *             type: string
 *             description: The status of the User "inscrit or not"
 *           proprietyImages:
 *             type: string
 *             description: The images of the property
 *           proprietyOccupation:
 *             type: string
 *             description: The landlordPassword of the User
 *           proofOfPropriety:
 *             type: string
 *             description: The profilImage url reference of the User
 *           listOfTenants:
 *             type: array
 *             items:
 *               type: object
 *           appartementType:
 *             type: string
 *           totalUnits:
 *             type: string
 *             description: The User identity paper
 *           occupiedUnits:
 *             type: string
 *           availableUnits:
 *             type: string
 */

/**
 * @swagger
 * tags:
 *   name: Landlords
 *   description: API to manage landlords
 */

/**
 * @swagger
 *   /users/landlords/:
 *     get:
 *       summary: Get all Landlords
 *       tags: [Landlords]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *       responses:
 *         "200":
 *           description: The list of landlords
 */
routerLandlord.get('/',authMiddleware, getLandlords)

/**
 * @swagger
 *   /users/landlords/{id}:
 *     get:
 *       summary: Get a landlord by id
 *       tags: [Landlords]
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
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord
 */
routerLandlord.get('/:id', authMiddleware, getLandlord)

/**
 * @swagger
 *   /users/landlords/photo-profil/{id}:
 *     get:
 *       summary: Get a landlord photo profile by id
 *       tags: [Landlords]
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
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord photo profile
 */
routerLandlord.get('/photo-profil/:id', getPhotoProfil)

/**
 * @swagger
 *   /users/landlords/proprieties/{id}:
 *     get:
 *       summary: Get a landlord proprieties by id
 *       tags: [Landlords]
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
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord proprieties
 */
routerLandlord.get('/proprieties/:id', getLandlordProprieties)

/**
 * @swagger
 *   /users/landlords/tenants/{id}:
 *     get:
 *       summary: Get a landlord tenants by id
 *       tags: [Landlords]
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
 *           description: Id of a landlord
 *       responses:
 *         "200":
 *           description: The landlord tenants
 */
routerLandlord.get('/tenants/:id', authMiddleware, getLandlordTenants)

/**
 * @swagger
 *   /users/landlords/signup:
 *     post:
 *       summary: sign up a landlord
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 landlordNumber:
 *                   type: string
 *                 landlordFirstname:
 *                   type: string
 *                   description: The firstname of the User
 *                 landlordLastname:
 *                   type: string
 *                   description: The lastname of the User
 *                 landlordPassword:
 *                   type: string
 *                   description: The landlordPassword of the User
 *                 landlordPasswordC:
 *                   type: string
 *                   description: The landlordPassword of the User
 *               example:
 *                 landlordNumber: "+2250140729371"
 *                 landlordFirstname: Coulibaly
 *                 landlordLastname: Zie Adama
 *                 landlordPassword: "54321"
 *                 landlordPasswordC: "54321"
 *       responses:
 *         "200":
 *           description: landlord sign up successfully
 */
routerLandlord.post('/signup', signupLandlord)

/**
 * @swagger
 *   /users/landlords/signin:
 *     post:
 *       summary: sign in a landlord
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 landlordNumber:
 *                   type: string
 *                 landlordPassword:
 *                   type: string
 *                   description: The landlordPassword of the User
 *               example:
 *                 landlordNumber: "+2250140729371"
 *                 landlordPassword: "54321"
 *       responses:
 *         "200":
 *           description: landlord sign in successfully
 */
routerLandlord.post('/signin', signinLandlord)

/**
 * @swagger
 *   /users/landlords/confirm/password/:id:
 *     post:
 *       summary: sign in a landlord
 *       tags: [Landlords]
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
 *           description: Id of a landlord
 *       requestBody:
 *         required: true
 *       responses:
 *         "200":
 *           description: landlord sign in successfully
 */
routerLandlord.post('/confirm/password/:id', authMiddleware, confirmLandlordPassword)

/**
 * @swagger
 *   /users/landlords/otp/send:
 *     post:
 *       summary: send otp for authentification
 *       tags: [Landlords]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 userNumber:
 *                   type: string
 *                 otpCode:
 *                   type: string
 *               example:
 *                 otpCode: "271011"
 *                 userNumber: "+2250140729371"
 *       responses:
 *         "200":
 *           description: otp send successfully
 */
routerLandlord.post('/otp/send',authMiddleware, sendAuthOTP)

/**
 * @swagger
 *   /users/landlords/otp/verify:
 *     post:
 *       summary: authentificate otp sended
 *       tags: [Landlords]
 *       parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 landlordNumber:
 *                   type: string
 *               example:
 *                 userNumber: "+2250140729371"
 *       responses:
 *         "200":
 *           description: authentification successfully
 */
routerLandlord.post('/otp/verify',authMiddleware, verifyAuthOTP, confirmSignupLandlord)

/**
 * @swagger
 *   /users/landlords/verify/number:
 *     post:
 *       summary: send token after verify landlord number
 *       tags: [Landlords]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 landlordNumber:
 *                   type: string
 *               example:
 *                 landlordNumber: "+2250140729371"
 *       responses:
 *         "200":
 *           description: successfully
 */
routerLandlord.post('/verify/number',verifyLandloardNumber)

/**
 * @swagger
 *   /users/landlords/add-tenant:
 *    put:
 *      summary: add tenant to a landord and property list of tenants
 *      tags: [Landlords]
 *      parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *      requestBody:
 *        required: true
 *        content:
 *           application/json:
 *             schema:
 *               properties:
 *                 proprietyName:
 *                   type: string
 *                 proprietyAdress:
 *                   type: string
 *                 proprietyType:
 *                   type: string
 *                 appartementNumber:
 *                   type: string
 *                 proprietyImages:
 *                   type: string
 *                 proprietyOccupation:
 *                   type: string
 *                 proofOfPropriety:
 *                   type: string
 *                 tenantRent:
 *                   type: string
 *                 appartementType:
 *                   type: string
 *                 totalUnits:
 *                   type: string
 *                 occupiedUnits:
 *                   type: string
 *                 availableUnits:
 *                   type: string
 *               example:
 *                 proprietyName: "Résidence Otaku"
 *                 landlordNumber: "+2250777866181"
 *                 tenantFirstname: "Konan"
 *                 tenantLastname: "Abou"
 *                 tenantNumber: "0543226271"
 *                 appartementNumber: "R1-04"
 *                 tenantRent: "150000"
 *                 appartementType: 2 pièces
 *      responses:
 *        200:
 *          description: The user was updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        404:
 *          description: The user was not found
 *        500:
 *          description: Some error happened
 *
 */
routerLandlord.put('/add-tenant', addTenant)
/* routerLandlord.put('/:_id',authMiddleware, updateLandlordNumber) */

/**
 * @swagger
 *   /users/landlords/update-password:
 *    put:
 *      summary: update a landord password
 *      tags: [Landlords]
 *      parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *      requestBody:
 *        required: true
 *        content:
 *           application/json:
 *             schema:
 *               properties:
 *                 landlordNumber:
 *                   type: string
 *                 landlordPassword:
 *                   type: string
 *                 landlordPasswordC:
 *                   type: string
 *               example:
 *                 landlordNumber: "+2250777866181"
 *                 landlordPassword: "88642"
 *                 landlordPasswordC: "88642"
 *      responses:
 *        200:
 *          description: The password was updated
 *          content:
 *            application/json:
 *              schema:
 *        404:
 *          description: The user was not found
 *        500:
 *          description: Some error happened
 *
 */
routerLandlord.put(('/update-password'), authMiddleware, updateLandlordPassword)

/**
 * @swagger
 *   /users/landlords/update-profil/:id:
 *    put:
 *      summary: update a landord information
 *      tags: [Landlords]
 *      consumes:
 *        - multipart/form-data
 *      parameters:
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
 *           description: Id of a landlord
 *         - in: formData
 *           name: identity
 *           type: file
 *           description: The file to upload.
 *      requestBody:
 *        required: true
 *        content:
 *           multipart/form-data:
 *             schema:
 *               properties:
 *                 landlordFirstname:
 *                   type: string
 *                 landlordLastname:
 *                   type: string
 *                 landlordAdress:
 *                   type: string
 *                 landlordNumber:
 *                   type: string
 *      responses:
 *        200:
 *          description: The user was updated
 *          content:
 *            application/json:
 *              schema:
 *        404:
 *          description: The user was not found
 *        500:
 *          description: Some error happened
 *
 */
routerLandlord.put(('/update-profil'),authMiddleware, updateProfil)

/**
 * @swagger
 *   /users/landlords/photo-profil:
 *    put:
 *      summary: update a landord photo profil
 *      tags: [Landlords]
 *      parameters:
 *         - in: header
 *           name: security
 *           schema:
 *             type: string
 *           required: true
 *      requestBody:
 *        required: true
 *      responses:
 *        200:
 *          description: The photo profil was updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        404:
 *          description: The user was not found
 *        500:
 *          description: Some error happened
 *
 */
routerLandlord.put(('/photo-profil'), authMiddleware, updateProfilImage)

/**
 * @swagger
 *   /users/landlords/:id:
 *     delete:
 *       summary: Delete a landlord by id
 *       tags: [Landlords]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a landlord
 */
routerLandlord.delete('/:id',authMiddleware, deleteLandlord)

/**
 * @swagger
 *   /users/landlords/delete-tenant/:id:
 *     delete:
 *       summary: Delete a tenant on proprieties and landlords data
 *       tags: [Landlords]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of a landlord
 *       requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                properties:
 *                  tenantNumber:
 *                    type: string
 *                  appartementNumber:
 *                    type: string
 *                example:
 *                  "tenantNumber": "0543226871"
 *                  "appartementNumber": "R1-03"
 */
routerLandlord.delete('/delete-tenant/:id', deleteTenant)


export default routerLandlord