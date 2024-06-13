import bcrypt from 'bcrypt';
import Tenant from '../models/Tenant.js';
import Landlord from '../models/Landlord.js';
import Propriety from '../models/Propriety.js';
// import { logger } from '../index.js';


const getTenants = ((req, res) => {
    Tenant.find({}).then(item => res.send(item))
})

const getTenant = (async (req, res) => {
     Tenant.findOne({ _id: req.params.id }).populate({"path" : "propriety"}).then(
        item => {
            if (!item) {
                res.json({"error" : "tenant doesn't exit"})
            }else{
                res.json({data : item});
            }
        })
        .catch(err => res.json({"error" : err.message}))
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

const updateTenant = async (req, res) => {
    try {
        const tenantId = req.params.id;

        // Rechercher le locataire par ID
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Locataire non trouvé' });
        }

        // Mettre à jour les champs du locataire
        tenant.tenantNumber = req.body.tenantNumber || tenant.tenantNumber;
        tenant.tenantFirstName = req.body.tenantFirstName || tenant.tenantFirstName;
        tenant.tenantLastName = req.body.tenantLastName || tenant.tenantLastName;
        tenant.tenantAdress = req.body.tenantAdress || tenant.tenantAdress;
        tenant.urlImage = req.body.urlImage || tenant.urlImage;
        tenant.tenantPassword = req.body.tenantPassword || tenant.tenantPassword;

        await tenant.save();
        console.log(tenant);

        res.status(200).json({ message: 'Locataire mis à jour avec succès', tenant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du locataire', error : error.message });
    }
}


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

    const tenant = await Tenant.findOne({ _id: req.params.id })
   
    if(!tenant){
      return  res.json({error : "Tenant not found"});
    }

    const propriety = await Propriety.findById(tenant.propriety);
    
    
   
    if (!propriety) {
        return res.status(400).json({
            message: "tenant isn't in propriety"
        })
    }

    const landlord = await Landlord.findOne({ _id: propriety.landLord });


    if (!landlord) {
        return res.status(400).json({
            message: "landlord doesn't find"
        })
    }


    const listOfTenantsP = propriety.listOfTenants
    const listOfTenantsL = landlord.listOfTenants

    const newListOfTenantsP = listOfTenantsP.filter(id => id !== req.params.id);
    const newListOfTenantsL = listOfTenantsL.filter(id => id !== req.params.id);

    propriety.listOfTenants = newListOfTenantsP
    landlord.listOfTenants = newListOfTenantsL

    propriety.landLord = propriety.Landlord;

    await propriety.save()
    await landlord.save()

    await Tenant.deleteOne({ _id: tenant._id.toString() }).then(result => res.json(result))
})

const addTenant = (async (req, res) => {
    try {

        const totalOfUnpaidRents = parseInt(req.body.nbOfUnpaidRents) * parseInt(req.body.tenantRent)
        const locataire = {
            tenantNumber: req.body.tenantNumber,
            proprietyName: req.body.proprietyName,
            tenantFirstName: req.body.tenantFirstname,
            tenantLastName: req.body.tenantLastname,
            appartementNumber: req.body.appartementNumber,
            tenantRent: req.body.tenantRent,
            appartementType: req.body.appartementType,
            nbOfUnpaidRents: req.body.nbOfUnpaidRents,
            totalOfUnpaidRents: totalOfUnpaidRents.toString(),
            propriety : req.body.proprietyId
        }

        console.log(req.body.tenantLastname)
        const tenant = new Tenant(locataire);
        await tenant.save();

        const landlord = await Landlord.findOne({ _id: req.params.id });
        const propriety = await Propriety.findOne({ _id : req.body.proprietyId });

        if (!propriety || !landlord) {
            res.status(400).json({
                message: "propriety or landlord doesn't find"
            })
        }

        if (!landlord.listOfTenants) {
            landlord.listOfTenants = [];
        }
        landlord.listOfTenants.push(tenant._id)
        await landlord.save().catch(error => {
            res.json({error : error.message})
            // log(400, "addTenant => landlord save catch", req.body, error.message)
            // res.status(500).json({ message: 'landlord save catch' });
        });

        if (!propriety.listOfTenants) {
            propriety.listOfTenants = [];
        }

        propriety.listOfTenants.push(tenant._id);
        propriety.occupiedUnits = parseInt(propriety.occupiedUnits) + 1;
        propriety.availableUnits = parseInt(propriety.availableUnits) - 1;
        propriety.landLord = propriety.landLord;
        await propriety.save().catch(error => {
            console.log("here")
            console.log(error)
            return res.json({error : error.message});
            // log(400, "addTenant => propriety save catch", req.body, error.message)
            // res.status(500).json({ message: 'propriety save catch' });
        });
        res.status(200).json({
            message: 'Élément ajouté avec succès',
            data: tenant
        });
    } catch (error) {
        log(400, "addTenant => try catch", req.body, error.message)
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'élément', error : error.message });
    }
})

// not used
// const deleteTenant = (async (req, res) => {
//     try {
//         const propriety = await Propriety.findById(req.params.id);
//         const landlord = await Landlord.findOne({ _id: propriety.landLord });

//         if (!propriety || !landlord) {
//             res.status(400).json({
//                 message: "propriety or landlord doesn't find"
//             })
//         }

//         const listOfTenantsP = propriety.listOfTenants
//         const listOfTenantsL = landlord.listOfTenants

//         const newListOfTenantsP = listOfTenantsP.filter(tenant => tenant.appartementNumber !== req.body.appartementNumber);
//         const newListOfTenantsL = listOfTenantsL.filter(tenant => tenant.appartementNumber !== req.body.appartementNumber);

//         propriety.listOfTenants = newListOfTenantsP
//         landlord.listOfTenants = newListOfTenantsL

//         await propriety.save()
//         await landlord.save()
//         res.send("Tenant correctly removed")
//     } catch (error) {
//         log(400, "deleteTenant => try catch", req.body, error.message)
//         res.json({
//             message: "deleteTenant doesn't work",
//             error: error.message
//         })
//     }
// })

export { addTenant, confirmTenantPassword, deleteTenant, getTenant, getTenants, signinTenant, signupTenant, updateTenantNumber, updateTenantPassword, updateTenant };

