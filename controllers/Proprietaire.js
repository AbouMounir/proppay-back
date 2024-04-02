import axios from 'axios';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import Landlord from '../models/Proprietaire.js';
import Propriety from '../models/Propriete.js';
import { upload } from './middleware/createOceanFolderMiddleware.js';
import { generateOTP } from './middleware/otpMiddleware.js';
import log from './middleware/winston.js';

// constante pour recuperer le code envoyé
let otpSend = "";
// Fonction pour créer un jeton JWT
const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "720h", // Durée de validité du token
    });
};

// Fonction pour valider le code (à implémenter selon vos besoins)
function isValidCode(userId, enteredCode) {
    if (userId == enteredCode) {
        return true;
    }
    return false;
}

// Stocker le nombre de demandes et les timestamps côté serveur
let requestsCount = {};
let codeTimestamps = {};

// Les différents endpoints

const addTenant = (async (req, res) => {
    try {
        const locataire = {
            tenantNumber: req.body.tenantNumber,
            proprietyName: req.body.proprietyName,
            tenantFirstname: req.body.tenantFirstname,
            tenantLastname: req.body.tenantLastname,
            appartementNumber: req.body.appartementNumber,
            tenantRent: req.body.tenantRent,
            appartementType: req.body.appartementType
        }

        const landlord = await Landlord.findOne({ landlordNumber: req.body.landlordNumber });
        const propriety = await Propriety.findOne({ proprietyId: req.body.landlordNumber + '-' + req.body.proprietyName });

        if (!propriety || !landlord) {
            res.status(400).json({
                message: "propriety or landlord doesn't find"
            })
        }

        landlord.listOfTenants.push(locataire)
        await landlord.save().catch(error => {
            log(400, "addTenant => landlord save catch", req.body, error.message)
            res.status(500).json({ message: 'landlord save catch' });
        });;

        propriety.listOfTenants.push(locataire);
        propriety.occupiedUnits = parseInt(propriety.occupiedUnits) + 1
        propriety.availableUnits = parseInt(propriety.availableUnits) - 1
        await propriety.save().catch(error => {
            log(400, "addTenant => propriety save catch", req.body, error.message)
            res.status(500).json({ message: 'propriety save catch' });
        });
        res.status(200).json({ message: 'Élément ajouté avec succès' });
    } catch (error) {
        log(400, "addTenant => try catch", req.body, error.message)
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'élément' });
    }
})

const deleteTenant = (async (req, res) => {
    try {
        const propriety = await Propriety.findById(req.params.id);
        const landlord = await Landlord.findOne({ landlordNumber: propriety.proprietyId.substr(0, 14) });

        if (!propriety || !landlord) {
            res.status(400).json({
                message: "propriety or landlord doesn't find"
            })
        }

        const listOfTenantsP = propriety.listOfTenants
        const listOfTenantsL = landlord.listOfTenants

        const newListOfTenantsP = listOfTenantsP.filter(tenant => tenant.get('appartementNumber') !== req.body.appartementNumber || tenant.get('tenantNumber') !== req.body.tenantNumber);
        const newListOfTenantsL = listOfTenantsL.filter(tenant => tenant.get('appartementNumber') !== req.body.appartementNumber);

        propriety.listOfTenants = newListOfTenantsP
        landlord.listOfTenants = newListOfTenantsL

        await propriety.save()
        await landlord.save()
        res.send("Tenant correctly removed")
    } catch (error) {
        log(400, "deleteTenant => try catch", req.body, error.message)
        res.json({
            message: "deleteTenant doesn't work",
            error: error.message
        })
    }
})

const sendAuthOTP = (async (req, res) => {
    try {

        dotenv.config({ path: './config/.env' })

        // le userNumber represente le msisdn
        const userNumber = req.body.userNumber
        const userNumberCount = userNumber.substring(6)

        if (requestsCount[userNumberCount] && requestsCount[userNumberCount] >= 2) {
            const timeDifference = new Date() - codeTimestamps[userNumberCount];
            if (timeDifference < 24 * 60 * 60 * 1000) { // 5 minutes en millisecondes
                return res.send("Limite de demandes atteinte. Attendez un moment avant de demander un nouveau code.");
            }
        }

        // Fonction pour créer un OTP
        const otpCode = generateOTP();

        // les éléments du body
        const userName = process.env.USER_NAME;
        const password = process.env.PASSWORD;
        const serviceid = process.env.SERVICEID;
        const sender = process.env.SENDER;
        const msg = `Votre code de sécurité pour [Nom de l'application] est : ${otpCode}. Valable [durée, ex: 5 min]. Ne partagez pas.`

        // Stocker le timestamp actuel
        codeTimestamps[userNumberCount] = new Date();

        // Incrémenter le compteur de demandes
        requestsCount[userNumberCount] = (requestsCount[userNumberCount] || 0) + 1;

        // l'api externe de m target
        const apiExterne = `https://api-public-2.mtarget.fr/messages?username=${userName}&password=${password}&serviceid=${serviceid}&msisdn=${userNumber}&sender=${sender}&msg=${msg}`;

        await axios.post(apiExterne, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            .then(resp => {
                otpSend = otpCode;
                res.status(201).json(
                    {
                        data: otpSend,
                        message: "otpSend"
                    })
            })
            .catch(error => {
                log(400, "sendAuthOTP => post on m target api catch", req.body, error.message)
                res.send("sendAuthOTP => post on m target api catch");
            });
    } catch (error) {
        log(400, "sendAuthOTP => try catch", req.body, error.message)
        res.send("sendAuthOTP => try catch");
    }
})

const verifyAuthOTP = (async (req, res) => {

    const { otpCode, userNumber } = req.body;
    const userNumberCount = userNumber.substring(4)

    // Vérifier si l'utilisateur a demandé un code récemment
    if (codeTimestamps[userNumberCount]) {
        const timeDifference = new Date() - codeTimestamps[userNumberCount];
        if (timeDifference > 5 * 60 * 1000) { // 5 minutes en millisecondes
            return res.send("Le code a expiré.");
        }
    }

    // Vérifier si le code est correct (à implémenter selon vos besoins)
    if (isValidCode(otpSend, otpCode)) {
        // Réinitialiser le compteur de demandes
        requestsCount[userNumberCount] = 0;
        return res.send("Code de vérification valide.");
    }
    res.send("Code de vérification invalide.");
});

const ajouterPropriete = (async (req, res) => {
    try {
        const proprietyId = req.params.LandlordNumber + '-' + req.body.ProprieteName
        const propriety = {
            ProprietyName: req.body.ProprietyName,
            ProprietyAdress: req.body.ProprietyAdress,
            ProprietyType: req.body.ProprietyType,
            ProprietyImages: req.body.ProprietyImages,
            proprietyOccupation: req.body.proprietyOccupation,
            proofOfPropriety: req.body.proofOfPropriety
        }

        const landlord = await Landlord.findOne({ landlordNumber: req.params.landlordNumber });
        landlord.listeLocataire.set(proprietyId, propriety)
        await landlord.save();

        res.status(200).json({ message: 'Élément ajouté avec succès' });
        console.log(landlord.listeLocataire);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'élément' });
    }
})

const confirmLandlordPassword = (async (req, res) => {
    try {
        await Landlord.findOne({ landlordNumber: req.params.landlordNumber })
            .then(
                async user => {
                    if (!user) {
                        return res.status(500).json({ message: "user n'existe pas" })
                    }
                    const valid = await bcrypt.compare(req.body.landlordPassword, user.landlordPassword)
                    if (!valid) {
                        return res.status(500).json({ message: 'mot de passe incorrect' })
                    }
                    return res.status(201).json({ message: 'mot de passe correct' })
                }
            )
            .catch(error => {
                log(400, "confirmLandlordPassword => findOne catch", req.body, error.message)
                res.send("confirmLandlordPassword => findOne catch");
            })
    } catch (error) {
        log(400, "confirmLandlordPassword => try catch", req.body, error.message)
        res.send("confirmLandlordPassword => try catch");
    }
})

const deleteLandlord = (async (req, res) => {
    const landlord = await Landlord.findOne({ landlordNumber: req.params.landlordNumber }).catch(
        error => {
            log(400, "deleteLandlord => findOne catch", req.body, error.message)
            res.send("deleteLandlord => findOne catch");
        }
    )
    await Landlord.deleteOne({ _id: landlord._id.toString() }).then(result => res.send(result)).catch(
        error => {
            log(400, "deleteLandlord => deleteOne catch", req.body, error.message)
            res.send("deleteLandlord => deleteOne catch");
        }
    )
})

const getLandlords = ((req, res) => {
    Landlord.find({}).then(item => res.send(item)).catch(
        error => {
            log(400, "getLandlords => findOne catch", req.body, error.message)
            res.send("getLandlords => findOne catch");
        }
    )
})

const getLandlord = (async (req, res) => {
    await Landlord.findOne({ landlordNumber: req.params.landlordNumber }).then(
        item => {
            if (!item) {
                res.send("user doesn't exit")
            }
            res.send(item);
        })
        .catch(
            error => {
                log(400, "getLandlord => findOne catch", req.body, error.message)
                res.send("getLandlord => findOne catch");
            }
        )
})

const getPhotoProfil = (async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ landlordNumber: req.params.landlordNumber });
        if (!landlord) {
            return res.status(404).send('user non trouvé.');
        }
        res.send(landlord.profilImage);
    } catch (error) {
        log(400, "getPhotoProfil => try catch", req.body, error.message)
        res.status(500).send('Erreur lors de la récupération de l\'image.');
    }
});

const getLandlordProprieties = (async (req, res) => {
    try {
        const landlord = await Landlord.findById(req.params.id);
        if (!landlord) {
            return res.status(404).send('user not find.');
        }

        const proprieties = landlord.listOfProprieties
        if (!proprieties) {
            return res.status(404).send('no proprieties find')
        }

        const proprietiesInfo = await Promise.all(proprieties.map(async (proprietyId) => {
            const propriety = await Propriety.findOne({ proprietyId: proprietyId }).catch(error => log(400, "getLandlordProprieties => findOne catch", req.body, error.message));
            return propriety
        }));

        res.send(proprietiesInfo)
    } catch (error) {
        log(400, "getLandlordProprieties => try catch", req.body, error.message)
        res.status(500).send('Erreur lors de la récupération des infos');
    }
})

const getLandlordTenants = (async (req, res) => {
    try {
        const landlord = await Landlord.findById(req.params.id);
        if (!landlord) {
            return res.status(404).send('user not find.');
        }

        const tenants = landlord.listOfTenants
        if (!tenants) {
            return res.status(404).send('no tenants find')
        }

        const tenantsInfo = await Promise.all(tenants.map(async (tenant) => {
            return tenant
        }));

        res.send(tenantsInfo)
    } catch (error) {
        log(400, "getLandlordTenants => try catch", req.body, error.message)
        res.status(500).send('Erreur lors de la récupération des infos');
    }
})

const updateProfil = (async (req, res) => {
    try {
        await upload('identity', 'landlords/pieces')(req, res, async function (error) {
            if (error) {
                //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfil" + " Error message :" + error.message);
                res.json({
                    message: "upload doesn't work",
                    error: error.message
                })
            }
            await Landlord.findOne({ landlordNumber: req.body.landlordNumber })
                .then(async user => {
                    if (!user) {
                        return res.status(500).json({ message: "user n'existe pas" })
                    }
                    user.landlordFirstname = req.body.landlordFirstname,
                        user.landlordLastname = req.body.landlordLastname,
                        user.landlordAdress = req.body.landlordAdress,
                        user.identity = req.file.location
                    await user.save().catch(error => {
                        //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfil" + " Error message :" + error.message);
                        res.json({
                            message: "user not save",
                            error: error.message
                        })
                    });
                    res.send(user)
                })
                .catch(error => {
                    //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfil" + " Error message :" + error.message);
                    res.json({
                        message: "findOne doesn't work",
                        error: error.message
                    })
                })
        })
    } catch (error) {
        //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfil" + " Error message :" + error.message);
        res.json({
            message: "updateProfil doesn't work",
            error: error.message
        })
    }
})

const updateProfilImage = (async (req, res) => {
    try {
        await upload('profile', 'photos de profil')(req, res, async function (error) {
            if (error) {
                //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfilImage" + " Error message :" + error.message);
                res.json({
                    message: "upload doesn't work",
                    error: error.message
                })
            }
            await Landlord.findOne({ landlordNumber: req.body.landlordNumber })
                .then(async user => {
                    if (!user) {
                        return res.status(500).json({ message: "user n'existe pas" })
                    }
                    console.log(req.file);
                    user.profilImage = req.file.location
                    await user.save();
                    res.send(user)
                })
                .catch(error => {
                    //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfilImage" + " Error message :" + error.message);
                    res.json({
                        message: "findOne doesn't work",
                        error: error.message
                    })
                })
        })
    } catch (error) {
        //logger.info("status code : 400" + " request object : " + JSON.stringify(req.body) + " API method name : POST : updateProfilImage" + " Error message :" + error.message);
        res.json({
            message: "updateProfilImage doesn't work",
            error: error.message
        })
    }
})

const updateLandlordPassword = (async (req, res) => {
    try {
        await Landlord.findOne({ landlordNumber: req.body.landlordNumber })
            .then(
                async user => {
                    if (!user) {
                        return res.status(500).json({ message: "user n'existe pas" })
                    }
                    if (req.body.landlordPassword !== req.body.landlordPasswordC) {
                        return res.status(500).json({ message: 'entrez le même mot de passe' })
                    }
                    await bcrypt.hash(req.body.landlordPassword, 10)
                        .then(hash_new => {
                            user.landlordPassword = hash_new
                            user.save();
                            res.send(user)
                        }).catch(error => {

                            log(400, "updateLandlordPassword => bscypt compare catch", req.body, error.message)
                            res.json({
                                message: "bscypt compare catch",
                                error: error.message
                            })
                        })
                }
            )
            .catch(error => {
                log(400, "updateLandlordPassword => findOne catch", req.body, error.message)
                res.json({
                    message: "findOne catch",
                    error: error.message
                })
            })
    } catch (error) {
        log(400, "updateLandlordPassword => try catch", req.body, error.message)
        res.json({
            message: "updateLandlordPassword doesn't work",
            error: error.message
        })
    }
})

/* const updateLandlordNumber = (async (req, res) => {
    try {
        await Landlord.findOne({ _id: req.params._id })
            .then(
                landlord => {
                    landlord.LandlordNumber = req.body.landlordNumber;
                    landlord.save();
                    res.send(landlord)
                }
            )
            .catch(error => console.log(error))
    } catch (error) {
        console.log(error);
    }
    "landlordNumber":"+2250785968796",
}) */

const signupLandlord = (async (req, res) => {
    try {
        const number = await Landlord.findOne({ landlordNumber: req.body.landlordNumber });
        if (number) {
            return res.json({ message: "User already exists" });
        }
        if (req.body.landlordPassword === req.body.landlordPasswordC) {
            bcrypt.hash(req.body.landlordPassword, 10)
                .then(async hash => {
                    const landlord = await new Landlord({
                        landlordFirstname: req.body.landlordFirstname,
                        landlordLastname: req.body.landlordLastname,
                        landlordNumber: req.body.landlordNumber,
                        landlordPassword: hash,
                    })
                    await landlord.save()
                        .then(() => {
                            const token = createToken(landlord._id);
                            console.log("inscrit");
                            res.status(201).json({
                                message: 'user enregistré !',
                                data: landlord,
                                token: token
                            })
                        })
                        .catch(error => {
                            log(400, "signupLandlord => save landlord catch", req.body, error.message)
                            res.status(400).json({
                                message: "save landlord catch",
                                error: error.message
                            })
                        });
                })
                .catch(error => {
                    log(400, "signupLandlord => bscript hash catch", req.body, error.message)
                    res.status(500).json({
                        message: "bscript hash catch",
                        error: error.message
                    })
                })
        }
    } catch (error) {
        log(400, "signupLandlord => try catch", req.body, error.message)
        res.status(500).json({
            message: "signup doesn't work",
            error: error.message
        })
    }
})

const signinLandlord = (async (req, res) => {
    try {
        await Landlord.findOne({ landlordNumber: req.body.landlordNumber }).then(
            landlord => {
                if (landlord == null) {
                    res.status(500).json({
                        status: "500",
                        message: 'user et / ou mot de passe incorrect'
                    })
                } else {
                    bcrypt.compare(req.body.landlordPassword, landlord.landlordPassword)
                        .then(valid => {
                            if (!valid) {
                                res.status(400).json({
                                    status: "400",
                                    message: 'user et / ou mot de passe incorrect'
                                })
                            }
                            if (valid) {
                                const token = createToken(landlord._id);
                                return res.status(201).json({
                                    status: "201",
                                    data: landlord,
                                    token: token,
                                    message: 'connected'
                                })
                            }
                        })
                        .catch(error => {
                            log(400, "signi,Landlord => bscypt compare catch", req.body, error.message)
                            res.json({
                                message: "bscypt compare doesn't work",
                                error
                            })
                        })
                }
            })
    } catch (error) {
        log(400, "signinLandlord => try catch", req.body, error.message)
        res.json({
            message: "signin doesn't work",
            error
        })
    }
})

export { addTenant, confirmLandlordPassword, deleteLandlord, deleteTenant, getLandlord, getLandlordProprieties, getLandlordTenants, getLandlords, getPhotoProfil, sendAuthOTP, signinLandlord, signupLandlord, updateLandlordPassword, updateProfil, updateProfilImage, verifyAuthOTP };

