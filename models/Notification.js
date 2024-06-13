import mongoose from "mongoose";

const Notification = mongoose.model('notifications', {
    userNumber: {
        type: String,
    },
    titleNotification: {
        type: String,
    },
    contentNotification: {
        type: String,
    },
    dateNotification: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default Notification;