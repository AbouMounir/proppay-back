import dotenv from 'dotenv';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Landlord from '../models/Landlord.js';
import Propriety from '../models/Propriety.js';
import Transaction from '../models/Transaction.js';
import { generateAndUploadPDF } from './middleware/generatePdf.js';
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
                        const msg = `Bonjour M/Mme/Mlle. ${tenantLastname} ${tenantFirstname},\nNous vous informons que vous devez payer ${totalOfUnpaidRents} correspondant aux loyers de ${nbOfUnpaidRents} mois pour votre ${appartementType} dans la propriété ${proprietyName} à ${propriety.proprietyAdress}.\nVeuillez effectuer le paiement, dès que possible, d'au moins ${tenantRent} ou le montant total de ${totalOfUnpaidRents} via le lien suivant : ${link}.\n Le lien est valable pour 5 jours et vous recevrez un nouveau lien en cas de non paiement.Cordialement, Nanbau.`

                        // l'api externe de Mtarget
                        const apiExterne = `https://api-public-2.mtarget.fr/messages?username=${userName}&password=${password}&serviceid=${serviceid}&msisdn=${tenantNumberMtarget}&sender=${sender}&msg=${msg}`;

                        await axios.post(apiExterne, {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })
                            .then(resp => { })
                            .catch(error => {
                                log(400, "sendPaymentLink => post on m target api catch", req.body, error.message)
                                return res.send('post on m target api catch')
                        });
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
        const landlord = await Landlord.findOne({ _id: req.body.landlordId }).populate({"path" : "listOfTenants"});
        if (!landlord) {
            res.send("landlord doesn't exist");
        }
        const tenant = landlord.listOfTenants.find(tenant => tenant._id == req.body.tenantId)
        if (!tenant) {
            res.send("tenant doesn't exist");
        }
        const propriety = tenant.propriety;
        if (!propriety) {
            return res.json({error : "propriety doesn't exist"})
        }
       
        const transaction = new Transaction({
            tenant: req.body.tenantId,
            landlord: req.body.landlordId,
            typeOfTransaction: req.body.typeOfTransaction,
            amount: req.body.amount,
            status: req.body.status,
            paymentMethod: req.body.paymentMethod,
            property : req.body.propertyId
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
        console.log(req.body.amount);
        console.log(landlord.count);
        if(parseInt(req.body.amount) > landlord.count){
            return res.status(500).json({
                message: "failed : insufficient funds"
            })
        }

        landlord.count -= parseInt(req.body.amount)

        landlord.save()

        const transaction =  new Transaction({
            tenant: req.body.tenantId,
            landlord: req.body.landlordId,
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


const finalizeTransaction = async (req, res) => {
    const transaction = Transaction.findById(req.body.transactionId).populate([{"path" : "landlord"}, {"path" : "tenant"}, {"path" : "property"} ]);
    if(!transaction) {
        res.status(404).json({
            error: "transaction not found"
        });
    }
    //hey
    const landlord = transaction.landlord
    const tenant = transaction.tenant;
    const property = Propriety.findOne({'_id' : tenant.propriety});
    await sendRentReceipt(landlord.landlordFirstname, landlord.landlordLastname, landlord.landlordNumber, tenant.tenantFirstName, tenant.tenantLastName, tenant.tenantNumber, transaction.paymentMethod, transaction.amount, tenant.appartementType, tenant.proprietyName, property.proprietyAdress)
    .then(async () => {
            transaction.status = req.body.status;
            landlord.count += parseInt(req.body.amount)
            await landlord.save()
            await transaction.save()
            res.status(200).json({
                message: 'Transaction updated successfully',
                data: transaction
            });
    })
    .catch(err => res.json({error : err}))
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

    try {
         await generateAndUploadPDF(template,data[0],num)
        .then(async (pdfUrl) =>{
            const shortDoUrl =  shortenUrl(pdfUrl)
            .then((data) => {
                const tenantNumber = "%2b" + data[0].Tnumber.substring(1)
                const msg = `Bonjour M. ${data[0].Tfirstname} ${data[0].Tlastname},\n Nous vous remercions pour le paiement de votre loyer correspondant à la somme de ${data[0].total} FCFA sur notre plateforme.\n Vous pouvez visualiser et télécharger votre quittance de loyer à partir du lien suivant : ${shortDoUrl}.\n L'équipe Nanbau vous remercie !`
                console.log("Generation et upload of pdf successed :" + pdfUrl);
                console.log(msg);
                const apiExterne = `https://api-public-2.mtarget.fr/messages?username=${userName}&password=${password}&serviceid=${serviceid}&msisdn=${tenantNumber}&sender=${sender}&msg=${msg}`;
                return pdfUrl
            })
            .catch(err => {
                console.log("erreur short link" + err);
                return  err;
            })
        })
        .catch(err => {
            console.log("generation pdf" + err);
             return  err;
        });
       
    } catch (error) {
        console.log("Error on generation et upload of pdf :" + error);
        return error
    }
    

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

}

const getLandlordTransactionsInfos = async (req, res) => {
    try {
        let transactionsInfo = [];
        const landlord = await Landlord.findOne({ _id: req.userId })
        const transactions = await Transaction.find({}).populate({"path" : "landlord"});
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
        const transactions = await Transaction.find({}).populate({"path" : "landlord"});
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
        const landlordId = transaction.landlord;
        const landlord = await Landlord.findOne({ "_id" : landlordId });
        const tenantId = transaction.tenant;
        const tenant = landlord.listOfTenants.filter(id => id === tenantId);
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


export { finalizeTransaction, createTransaction, getLandlordTransactionsInfos, getTransactionInfo, getTransactionsInfos, getUploadLink, getoutTransaction, sendPaymentLink, sendRentReceipt };

