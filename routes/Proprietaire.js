import express from 'express';
const routerLandlord = express.Router()

import {
    addTenant,
    confirmLandlordPassword,
    deleteLandlord,
    deleteTenant,
    getLandlord,
    getLandlordProprieties,
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


routerLandlord.get('/',authMiddleware, getLandlords)
routerLandlord.get('/:landlordNumber',authMiddleware, getLandlord)
routerLandlord.get('/photo-profil/:landlordNumber', getPhotoProfil)
routerLandlord.get('/proprieties/:id', getLandlordProprieties)


routerLandlord.post('/signup', signupLandlord)
routerLandlord.post('/signin', signinLandlord)
routerLandlord.post('/confirm/password/:landlordNumber',authMiddleware, confirmLandlordPassword)
routerLandlord.post('/otp/send',sendAuthOTP)
routerLandlord.post('/otp/verify', verifyAuthOTP)

routerLandlord.put('/add-tenant', addTenant)
/* routerLandlord.put('/:_id',authMiddleware, updateLandlordNumber) */
routerLandlord.put(('/update-password/:landlordNumber'),authMiddleware, updateLandlordPassword)
routerLandlord.put(('/update-profil'),authMiddleware, updateProfil)
routerLandlord.put(('/photo-profil'),authMiddleware, updateProfilImage)

routerLandlord.delete('/:landlordNumber',authMiddleware, deleteLandlord)
routerLandlord.delete('/delete-tenant/:id', deleteTenant)


export default routerLandlord