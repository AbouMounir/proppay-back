import nodeCron from 'node-cron';
import Notification from "../models/Notification.js";
import Landlord from '../models/Proprietaire.js';

const task1 = nodeCron.schedule('30 5 14 3 * *', async () => {
    try {
        const landlords = await Landlord.find({})
        for (const landlord of landlords){
            const notification = await new Notification({
                titleNotification: "Envoi des liens de paiement aux locataires",
                contentNotification: `Bonjour ${landlord.landlordLastname} ${landlord.landlordFirstname},\n J'espère que vous allez bien. Je voulais juste vous informer que j'ai envoyé les liens de paiement des loyers aux locataires pour le mois en cours.\n Tous les détails nécessaires sont inclus dans les messages envoyés.\n N'hésitez pas à me contacter si vous avez des questions ou des préoccupations à ce sujet.\n Cordialement,[Votre nom]`,
            })
            await notification.save()
        }
        console.log("les notifications sont enregistrés");
    } catch (error) {
        console.log(error);
    }
})

const createNotification = (async(req,res) => {
    try {
        const notification = await new Notification({
            titleNotification: req.body.titleNotification,
            contentNotification: req.body.contentNotification,
        })

        await notification.save()

        res.status(200).json({
            message: 'Notification ajouté avec succès',
            data: notification
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

const getAllNotification = (async(req,res) => {
    Notification.find({}).sort({ dateNotification: -1 }).then(item => res.send(item));
})

const getOneNotification = (async(req,res) => {
    
})

const markNotificationAsRead = (async(req,res) => {
    try {
        await Notification.findOne({ _id : req.params.id })
            .then(
                async notification => {
                    if (!notification) {
                        return res.status(500).json({ message: "notification n'existe pas" })
                    }
                    notification.isRead = true
                    await notification.save()
                    res.send(notification)
                }
            )
            .catch(error => console.log(error))
    } catch (error) {
        
    }
})

const deleteNotification = (async(req,res) => {
    const notification = await Notification.findOne({ _id: req.params.id })
    await Notification.deleteOne({ _id: notification._id.toString() }).then(result => res.send(result))
})


export { createNotification, deleteNotification, getAllNotification, markNotificationAsRead };
