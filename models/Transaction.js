import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tenants",
        default: ""
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "landlords",
        default: ""
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "proprietes",
        default: ""
    },
    typeOfTransaction: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['OM_CI','MOOV_CI','MTN_CI','WAVE_CI', 'paypal'], // Ajoutez d'autres méthodes de paiement si nécessaire
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentReceipt: {
        type: String,
    },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
