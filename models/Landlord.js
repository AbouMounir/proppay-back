import mongoose from "mongoose";

const Landlord = mongoose.model('landlords', {
    landlordNumber: {
        type: String,
        unique: true,
        // required: [true, "Your landlord number is required"],
    },
    landlordFirstname: {
        type: String,
        // required: [true, "Your landlord name is required"],
    },
    landlordLastname: {
        type: String,
        // required: [true, "Your landlord prename is required"],
    },
    status: {
        type: String,
        default: "En cours d'inscription"
    },
    landlordAdress: {
        type: String
    },
    profilImage: String,
    landlordPassword: {
        type: String
    },
    identity: {type : String, default : ""},
    listOfTenants:  [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tenants",
        default: [],
        },
    ],
    listOfProprieties: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "proprietes",
        default: [],
        },
    ],
    count: {
        type: Number,
        default: 0
    },
    notification : {
        type : String,
        default : ""
    }
});

export default Landlord ;