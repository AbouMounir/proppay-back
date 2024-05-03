import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path, { dirname } from 'path';
import pdf from 'pdf-creator-node';
import { fileURLToPath } from 'url';
import Landlord from '../models/Proprietaire.js';
import Propriety from '../models/Propriete.js';
import Transaction from '../models/Transaction.js';
import { uploadTemplate } from './middleware/createOceanFolderMiddleware.js';
import log from './middleware/winston.js';

dotenv.config({ path: './config/.env' })

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var filePath = "";

const monthes = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Decembre"];
const days = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"]
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
                        const propriety = await Propriety.findOne({proprietyId : landlord.landlordNumber + '-' + proprietyName})
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
        const landlord = await Landlord.findOne({landlordNumber: req.body.landlordNumber})
        if (!landlord) {
            res.send("landlord doesn't exist")
        }
        const tenant = landlord.listOfTenants.reduce(tenantNumber => tenantNumber == req.body.tenantNumber)
        if (!tenant) {
            res.send("tenant doesn't exist")
        }
        const propriety_id = landlord.listOfProprieties.reduce(proprietyName => proprietyName == tenant.proprietyName)
        const propriety = await Propriety.findOne({proprietyId: propriety_id})
        if (!propriety) {
            res.send("propriety doesn't exist")
        }
        
        await sendRentReceipt(landlord.landlordFirstname,landlord.landlordLastname,landlord.landlordNumber,tenant.tenantFirstname,tenant.tenantLastname,tenant.tenantNumber,req.body.paymentMethod,req.body.amount,tenant.appartementType,tenant.proprietyName,propriety.proprietyAdress).then(data => do_url = data)
        
        const transaction = await new Transaction({
            tenant: req.body.tenantNumber,
            landlord: req.body.landlordNumber,
            typeOfTransaction: req.body.typeOfTransaction,
            amount: req.body.amount,
            status: req.body.status,
            paymentMethod: req.body.paymentMethod,
            paymentReceipt: do_url
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

const sendRentReceipt =  async (Lfirstname,Llastname,Lnumber,Tfirstname, Tlastname,Tnumber,paymentMethod,amount,proprietyType,proprietyName,proprietyAdress) => {
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
            url: "https://propay-storage.ams3.cdn.digitaloceanspaces.com/propay_doc/logo-propay.png"
        }]
    
        const template = fs.readFileSync(path.join(__dirname, '../propay-facture/index.html'), 'utf-8');
        const options = { format: 'Letter' };
        const document = {
            html: template,
            data: {
                datas : data,
            },
            path: path.join(__dirname, '../template.pdf')
        }
        
        pdf.create(document, {
            childProcessOptions: {
                env: {
                    OPENSSL_CONF: '/dev/null',
                },
            }
        })
        .catch(error => console.log(error))
        
        filePath = document.path;
        const objectKey = Date.now() + "LN" + data[0].Lnumber.substring(4) + ".pdf"
        const fileStream = fs.createReadStream(filePath);
        const do_url = await uploadTemplate(objectKey,fileStream);
    
        const tenantNumber = "%2b" + data[0].Tnumber.substring(1)
        const msg = `Bonjour M. ${data[0].Tfirstname} ${data[0].Tlastname},\nNous vous remercions pour le paiement de votre loyer correspondant à la somme de ${data[0].total} FCFA sur notre plateforme.\nVous pouvez visualiser et télécharger votre quittance de loyer à partir du lien suivant : ${do_url}.\n L'équipe Propay vous remercie !`
        
        const apiExterne = `https://api-public-2.mtarget.fr/messages?username=${userName}&password=${password}&serviceid=${serviceid}&msisdn=${tenantNumber}&sender=${sender}&msg=${msg}`;
        
        await axios.post(apiExterne, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            .then()
            .catch(error => {
                log(400, "sendRentReceipt => post on m target api catch", req.body, error.message)
                return res.send('post on m target api catch')
        });
        return do_url
}

const getLandlordTransactionsInfos = async (req, res) => {
    try {
        let transactionsInfo = [];
        console.log("user id" +  req.userId)
        const landlord = await Landlord.findOne({_id : req.userId})
        console.log(landlord);
        const transactions = await Transaction.find({});
        for (const transaction of transactions) {
            const landlordNumber = transaction.landlord;
            if (landlordNumber == landlord.landlordNumber) {
                const tenantNumber = transaction.tenant;
                const tenant = landlord.listOfTenants.find(tenant => tenant.tenantNumber === tenantNumber);
                const tenantName = `${tenant.tenantLastname} ${tenant.tenantFirstname}`;
                transactionsInfo.push({ transaction, tenantName })
            }
        }
        res.status(500).json({
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
            const tenant = landlord.listOfTenants.find(tenant => tenant.tenantNumber === tenantNumber);
            const tenantName = `${tenant.tenantLastname} ${tenant.tenantFirstname}`;
            transactionsInfo.push({ transaction, tenantName });
        }
        res.status(500).json({
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
        const tenant = landlord.listOfTenants.find(tenant => tenant.tenantNumber === tenantNumber);
        const tenantName = `${tenant.tenantLastname} ${tenant.tenantFirstname}`;
        res.status(500).json({
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

const getUploadLink = async (req,res) => {
    const transaction = await Transaction.findById(req.params.id)
    res.send(transaction.paymentReceipt)
}


// sendRentReceipt()


export { createTransaction, getLandlordTransactionsInfos, getTransactionInfo, getTransactionsInfos, getUploadLink, sendPaymentLink, sendRentReceipt };

