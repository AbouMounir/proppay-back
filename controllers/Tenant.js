import bcrypt from 'bcrypt';
import Tenant from '../models/Tenant.js';


const getTenants = ((req, res) => {
    Tenant.find({}).then(item => res.send(item))
})

const getTenant = (async (req, res) => {
    await Tenant.findOne({ tenantNumber: req.params.tenantNumber }).then(
        item => {
            if (!item) {
                res.send("user doesn't exit")
            }
            res.send(item);
        })
})

const signupTenant = (async (req, res) => {
    try {
        const number = await Tenant.findOne({ tenantNumber: req.body.tenantNumber });
        if (number) {
            return res.json({ message: "User already exists" });
        }
        if (req.body.tenantPassword === req.body.tenantPasswordC) {
            bcrypt.hash(req.body.tenantPassword, 10)
            .then(async hash => {
                const tenant = await new Tenant({
                    tenantFirstName: req.body.tenantFirstName,
                    tenantLastName: req.body.tenantLastName,
                    tenantNumber: req.body.TenantNumber,
                    tenantPassword: hash,
                })
                await tenant.save()
                    .then(() => res.status(201).json({
                        message: 'user enregistré !',
                        data: tenant
                    }))
                    .catch(error => res.status(400).json({ error }));
                console.log(tenant);
            })
            .catch(error => res.status(500).json({ error }))
        }
    } catch (error) {
        console.log(error);
    }
})

const signinTenant = (async (req, res) => {
    await Tenant.findOne({ tenantNumber: req.body.tenantNumber }).then(
        tenant => {
            if (tenant == null) {
                res.status(500).json({
                    status: "500",
                    message: 'user et / ou mot de passe incorrect'
                })
            } else {
                bcrypt.compare(req.body.tenantPassword, tenant.TenantPassword)
                    .then(valid => {
                        console.log('valid');
                        if (valid == false) {
                            res.status(400).json({
                                status: "400",
                                message: 'user et / ou mot de passe incorrect'
                            })
                        } else {
                            return res.status(201).json({
                                status: "201",
                                data: tenant,
                                message: 'connected'
                            })
                        }
                    })
                    .catch(error => res.json({ error }))
            }
        })
})

const confirmTenantPassword = (async (req,res) => {
    try {
        await Tenant.findOne({ tenantNumber : req.params.tenantNumber })
            .then(
                async user => {
                    if (!user) {
                        return res.status(500).json({ message: "user n'existe pas" })
                    }
                    const valid = await bcrypt.compare(req.body.tenantPassword, user.tenantPassword)
                    if (!valid) {
                        return res.status(500).json({ message: 'mot de passe incorrect' })
                    }
                    return res.status(201).json({ message: 'mot de passe correct' })
                }
            )
            .catch(error => console.log(error))
    } catch (error) {
        console.log(error);
    }
})


const updateTenantPassword = (async (req,res) => {
    try {
        await Tenant.findOne({ tenantNumber : req.params.tenantNumber })
            .then(
                async user => {
                    if (!user) {
                        return res.status(500).json({ message: "user n'existe pas" })
                    }
                    if (req.body.tenantPassword !== req.body.tenantPasswordC) {
                        return res.status(500).json({ message: 'entrez le même mot de passe' })
                    }
                    await bcrypt.hash(req.body.tenantPassword, 10)
                        .then(hash_new => {
                            user.tenantPassword = hash_new
                            user.save();
                            res.send(user)
                        })
                }
            )
            .catch(error => console.log(error))
    } catch (error) {
        console.log(error);
    }
})

const updateTenantNumber = (async (req, res) => {
    try {
        await Tenant.findOne({ _id: req.params._id })
            .then(
                tenant => {
                    tenant.tenantNumber = req.body.tenantNumber;
                    tenant.save();
                    res.send(tenant)
                }
            )
            .catch(error => console.log(error))
    } catch (error) {
        console.log(error);
    }
})

const deleteTenant = (async (req, res) => {
    const tenant = await Tenant.findOne({ tenantNumber: req.params.tenantNumber })
    await Tenant.deleteOne({ _id: tenant._id.toString() }).then(result => res.send(result))
})

export { confirmTenantPassword, deleteTenant, getTenant, getTenants, signinTenant, signupTenant, updateTenantNumber, updateTenantPassword };

