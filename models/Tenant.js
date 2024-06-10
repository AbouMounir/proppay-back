import mongoose from "mongoose";

const Tenant = mongoose.model('tenants', {
    tenantNumber: {
        type: String,
        unique: true,
        required: [true, "Your tenant number is required"],
    },
    tenantFirstName: {
        type: String,
        required: [true, "Your tenant name is required"],
    },
    tenantLastName: {
        type: String,
        required: [true, "Your tenant prename is required"],
    },
    tenantAdress: {
        type: String
    },
    propriety: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "proprietes",
        },
    urlImage: {
        type: String,
        default: ''
    },
    tenantPassword: {
        type: String
    }
});

export default Tenant ;