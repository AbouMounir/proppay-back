import express from 'express';
const routerTenant = express.Router()

import {
    confirmTenantPassword,
    deleteTenant,
    getTenant,
    getTenants,
    signinTenant,
    signupTenant,
    updateTenantNumber,
    updateTenantPassword
} from '../controllers/Locataire.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';


routerTenant.get('/',authMiddleware, getTenants)
routerTenant.get('/:tenantNumber',authMiddleware, getTenant)

routerTenant.post('/signup', signupTenant)
routerTenant.post('/signin', signinTenant)
routerTenant.post('/confirm/password/:tenantNumber', confirmTenantPassword)

routerTenant.put('/:_id',authMiddleware, updateTenantNumber)
routerTenant.put(('/update-password/:tenantNumber'),authMiddleware, updateTenantPassword)
routerTenant.delete('/:tenantNumber',authMiddleware, deleteTenant)

export default routerTenant