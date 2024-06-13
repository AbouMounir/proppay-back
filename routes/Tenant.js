import express from 'express';
const routerTenant = express.Router()

import {
    confirmTenantPassword,
    deleteTenant,
    getTenant,
    getTenants,
    signinTenant,
    signupTenant,
    updateTenant,
    updateTenantNumber,
    updateTenantPassword,
    addTenant
} from '../controllers/Tenant.js';
import { authMiddleware } from '../controllers/middleware/authMiddleware.js';



routerTenant.get('/',authMiddleware, getTenants)
routerTenant.get('/:id', getTenant)

routerTenant.post('/signup', signupTenant)
routerTenant.post('/signin', signinTenant)
routerTenant.post('/confirm/password/:tenantNumber', confirmTenantPassword)
routerTenant.put('/:_id',authMiddleware, updateTenantNumber)
routerTenant.put(('/update-password/:tenantNumber'),authMiddleware, updateTenantPassword)
routerTenant.delete('/:id',authMiddleware, deleteTenant)



routerTenant.put('/:id', updateTenant);
routerTenant.delete('/delete-tenant/:id', deleteTenant)

export default routerTenant