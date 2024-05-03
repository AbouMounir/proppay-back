import Notification from "../models/Notification.js";

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
