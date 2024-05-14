import dotenv from 'dotenv';
import fs from 'fs';
import path, { dirname } from 'path';
import pdf from 'pdf-creator-node';
import { fileURLToPath } from 'url';
import Landlord from '../models/Proprietaire.js';
import Propriety from '../models/Propriete.js';
import Transaction from '../models/Transaction.js';
import { uploadTemplate } from './middleware/createOceanFolderMiddleware.js';
import { shortenUrl } from './middleware/generateUrl.js';
import log from './middleware/winston.js';

dotenv.config({ path: './config/.env' })

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var filePath = "";

const monthes = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"];
const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
// the elements of body
const userName = process.env.USER_NAME;
const password = process.env.PASSWORD;
const serviceid = process.env.SERVICEID;
const sender = process.env.SENDER;


/* // Database to store mappings between short URLs and original URLs
const urlDatabase = {};

// Endpoint to shorten a URL
const shortenUrl = async (req, res) => {
    const originalUrl = req.body.url;
    if (!originalUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const shortUrl = generateShortUrl(originalUrl);
    urlDatabase[shortUrl] = originalUrl;
    res.json({ shortUrl: `http://yourdomain.com/${shortUrl}` }); // Replace "yourdomain.com" with your actual domain
};

// Endpoint to redirect to the original URL app.get('/:shortUrl',
const redirectToOriginalUrl = (req, res) => {
    const shortUrl = req.params.shortUrl;
    const originalUrl = urlDatabase[shortUrl];
    if (!originalUrl) {
        return res.status(404).send('Short URL not found');
    }
    res.redirect(originalUrl);
}; */

const sendPaymentLink = (async (req, res) => {
    try {

        // the link to pay a rent
        const link = req.body.link

        const landlords = await Landlord.find()

        landlords.forEach(landlord => {
            const listOfTenants = landlord.listOfTenants;
            if (listOfTenants.length !== 0) {
                listOfTenants.forEach(async tenant => {
                    if (tenant.tenantNumber) {

                        const { tenantNumber, proprietyName, tenantFirstname, tenantLastname, appartementNumber, tenantRent, appartementType, nbOfUnpaidRents, totalOfUnpaidRents } = tenant;
                        const tenantNumberMtarget = "%2b" + tenantNumber.substring(1)
                        const propriety = await Propriety.findOne({ proprietyId: landlord.landlordNumber + '-' + proprietyName })
                        if (!propriety) {
                            return res.send("propriety doesn't find")
                        }
                        const msg = `Bonjour M/Mme/Mlle. ${tenantLastname} ${tenantFirstname},\nNous vous informons que vous devez payer ${totalOfUnpaidRents} correspondant aux loyers de ${nbOfUnpaidRents} mois pour votre ${appartementType} dans la propriété ${proprietyName} à ${propriety.proprietyAdress}.\nVeuillez effectuer le paiement, dès que possible, d'au moins ${tenantRent} ou le montant total de ${totalOfUnpaidRents} via le lien suivant : ${link}.\n Le lien est valable pour 5 jours et vous recevrez un nouveau lien en cas de non paiement.Cordialement, Propay.`

                        // l'api externe de Mtarget
                        /* const apiExterne = `https://api-public-2.mtarget.fr/messages?username=${userName}&password=${password}&serviceid=${serviceid}&msisdn=${tenantNumberMtarget}&sender=${sender}&msg=${msg}`;

                        await axios.post(apiExterne, {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })
                            .then(resp => { })
                            .catch(error => {
                                log(400, "sendPaymentLink => post on m target api catch", req.body, error.message)
                                return res.send('post on m target api catch')
                        }); */
                        console.log(msg);
                    }
                })
            }
        });
        res.send('all links sent correctly')
    } catch (error) {
        log(500, "sendPaymentLink => try catch", req.body, error.message)
        res.send("sendPaymentLink => try catch");
    }
})

// Planifiez l'envoi des rappels pour le 25 de chaque mois à 8h00
const schedulePaymentLink = () => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), 25, 8, 0, 0); // Date cible : le 25 du mois en cours à 8h00
    const timeUntilTargetDate = targetDate.getTime() - today.getTime();

    // Vérifiez si la date cible est déjà passée pour ce mois
    if (timeUntilTargetDate < 0) {
        targetDate.setMonth(targetDate.getMonth() + 1); // Passez au mois suivant
    }

    // Planifiez l'envoi des rappels pour le 25 de chaque mois à 8h00
    setInterval(sendPaymentLink, 30 * 24 * 60 * 60 * 1000); // Vérifiez toutes les 30 jours
};

const createTransaction = async (req, res) => {
    try {
        let do_url = ""
        let shortDoUrl = ""
        const landlord = await Landlord.findOne({ landlordNumber: req.body.landlordNumber })
        if (!landlord) {
            res.send("landlord doesn't exist")
        }
        const tenant = landlord.listOfTenants.filter(tenant => tenant.tenantNumber == req.body.tenantNumber)
        if (!tenant) {
            res.send("tenant doesn't exist")
        }
        const proprietyIdBody = landlord.landlordNumber + "-" + tenant[0].proprietyName
        const propriety_id = landlord.listOfProprieties.filter(proprietyId => proprietyId == proprietyIdBody)
        const propriety = await Propriety.findOne({ proprietyId: propriety_id[0] })
        if (!propriety) {
            res.send("propriety doesn't exist")
        }

        await sendRentReceipt(landlord.landlordFirstname, landlord.landlordLastname, landlord.landlordNumber, tenant[0].tenantFirstname, tenant[0].tenantLastname, tenant[0].tenantNumber, req.body.paymentMethod, req.body.amount, tenant[0].appartementType, tenant[0].proprietyName, propriety.proprietyAdress).then(data => do_url = data)

        await shortenUrl(do_url).then(data => shortDoUrl = data)
        const transaction = await new Transaction({
            tenant: req.body.tenantNumber,
            landlord: req.body.landlordNumber,
            typeOfTransaction: req.body.typeOfTransaction,
            amount: req.body.amount,
            status: req.body.status,
            paymentMethod: req.body.paymentMethod,
            paymentReceipt: shortDoUrl
        })

        landlord.count += parseInt(req.body.amount)

        await landlord.save()
        await transaction.save()

        res.status(200).json({
            message: 'Transaction ajouté avec succès',
            data: transaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}

const getoutTransaction = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ _id: req.userId })
        landlord.count -= parseInt(req.body.amount)

        landlord.save()

        const transaction = await new Transaction({
            tenant: req.body.tenantNumber,
            landlord: req.body.landlordNumber,
            typeOfTransaction: req.body.typeOfTransaction,
            amount: req.body.amount,
            status: req.body.status,
            paymentMethod: req.body.paymentMethod,
        })

        transaction.save()

        res.status(200).json({
            message: "success",
            data: landlord
        })
    } catch (error) {
        console.log(error);
        res.send("Error : " + error)
    }
}

const sendRentReceipt = async (Lfirstname, Llastname, Lnumber, Tfirstname, Tlastname, Tnumber, paymentMethod, amount, proprietyType, proprietyName, proprietyAdress) => {
    const d = new Date();
    let month = monthes[d.getMonth()];
    let day = days[d.getDay()]
    let dayDate = d.getDate()
    let year = d.getFullYear()
    const data = [{
        day: day,
        dayDate: dayDate,
        month: month,
        year: year,
        Lfirstname: Lfirstname,
        Llastname: Llastname,
        Lnumber: Lnumber,
        Tfirstname: Tfirstname,
        Tlastname: Tlastname,
        Tnumber: Tnumber,
        paymentMethod: paymentMethod,
        loyer: amount,
        total: amount,
        tenantRent: amount,
        proprietyType: proprietyType,
        proprietyName: proprietyName,
        proprietyAdress: proprietyAdress,
        url: `https://${process.env.BUCKET}.ams3.cdn.digitaloceanspaces.com/propay_doc/logo-propay.png`
    }]
    const num = Math.floor(Math.random() * 10);
    const template = fs.readFileSync(path.join(__dirname, '../propay-facture/index.html'), 'utf-8');
    const options = { format: 'Letter' };
    const document = await {
        html: template,
        data: {
            datas: data,
        },
        path: `/tmp`
    }
    try {
        const pdfs = await pdf.create(document, {
            childProcessOptions: {
                env: {
                    OPENSSL_CONF: '/dev/null',
                },
            }
        })
        console.log("création du pdf success", pdfs)
    }
    catch(error) {
        console.log("erreur lors de la création du pdf" + error)
    }

    const pathPdf = document.path;
    const objectKey = Date.now() + "LN" + data[0].Lnumber.substring(4) + ".pdf"
    const fileStream = fs.createReadStream(pathPdf);
    const do_url = await uploadTemplate(objectKey, fileStream).catch(error => console.log(error));

    const shortDoUrl = await shortenUrl(do_url)

    const tenantNumber = "%2b" + data[0].Tnumber.substring(1)
    const msg = `Bonjour M. ${data[0].Tfirstname} ${data[0].Tlastname},\n Nous vous remercions pour le paiement de votre loyer correspondant à la somme de ${data[0].total} FCFA sur notre plateforme.\n Vous pouvez visualiser et télécharger votre quittance de loyer à partir du lien suivant : ${shortDoUrl}.\n L'équipe Propay vous remercie !`

    console.log(msg);
    const apiExterne = `https://api-public-2.mtarget.fr/messages?username=${userName}&password=${password}&serviceid=${serviceid}&msisdn=${tenantNumber}&sender=${sender}&msg=${msg}`;

    /* await axios.post(apiExterne, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then()
        .catch(error => {
            log(400, "sendRentReceipt => post on m target api catch", req.body, error.message)
            return res.send('post on m target api catch')
    }); */
    return do_url
}

const getLandlordTransactionsInfos = async (req, res) => {
    try {
        let transactionsInfo = [];
        const landlord = await Landlord.findOne({ _id: req.userId })
        const transactions = await Transaction.find({});
        for (const transaction of transactions) {
            const landlordNumber = transaction.landlord;
            if (landlordNumber == landlord.landlordNumber) {
                const tenantNumber = transaction.tenant;
                const tenant = landlord.listOfTenants.filter(tenant => tenant.tenantNumber === tenantNumber);
                let tenantName = "";
                if (tenant.length != 0) {
                    tenantName = `${tenant[0].tenantLastname} ${tenant[0].tenantFirstname}`;
                }
                console.log(tenantName);
                transactionsInfo.push({ transaction, tenantName })
            }
        }
        res.status(200).json({
            message: "the info about a transaction",
            data: transactionsInfo
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Error in the try component",
            data: error.message
        });
    }
};

const getTransactionsInfos = async (req, res) => {
    try {
        let transactionsInfo = [];
        const transactions = await Transaction.find({});
        for (const transaction of transactions) {
            const landlordNumber = transaction.landlord;
            const landlord = await Landlord.findOne({ landlordNumber });
            const tenantNumber = transaction.tenant;
            const tenant = landlord.listOfTenants.filter(tenant => tenant.tenantNumber === tenantNumber);
            const tenantName = `${tenant.tenantLastname} ${tenant.tenantFirstname}`;
            transactionsInfo.push({ transaction, tenantName });
        }
        res.status(200).json({
            message: "the info about a transaction",
            data: transactionsInfo
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Error in the try component",
            data: error.message
        });
    }
};

const getTransactionInfo = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        const landlordNumber = transaction.landlord;
        const landlord = await Landlord.findOne({ landlordNumber });
        const tenantNumber = transaction.tenant;
        const tenant = landlord.listOfTenants.filter(tenant => tenant.tenantNumber === tenantNumber);
        const tenantName = `${tenant.tenantLastname} ${tenant.tenantFirstname}`;
        res.status(200).json({
            message: "the info about a transaction",
            data: { transaction, tenantName }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error in the try component",
            data: error.message
        });
    }
};

const getUploadLink = async (req, res) => {
    const transaction = await Transaction.findById(req.params.id)
    res.send(transaction.paymentReceipt)
}


//sendRentReceipt()


export { createTransaction, getLandlordTransactionsInfos, getTransactionInfo, getTransactionsInfos, getUploadLink, getoutTransaction, sendPaymentLink, sendRentReceipt };

