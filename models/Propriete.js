import mongoose from "mongoose";

const Propriety = mongoose.model('proprietes', {
    proprietyId: {
        type: String,
    },
    proprietyName: {
        type: String,
        /* required: [true, "The Propriety fullname is required"], */
    },
    proprietyAdress: {
        type: String,
        /* required: [true, "The Propriety adress is required"] */
    },
    proprietyType: {
        type: String,
        /* required: [true, "The Propriety type is required"], */
    },
    proprietyImages: String,
    proprietyOccupation: {
        type: String,
        /* required: [true, "'Is a propriety' occupied is requiried"] */
    },
    proofOfPropriety: String,
    totalUnits: String,
    occupiedUnits: String,
    availableUnits: String,
    listOfTenants: {
        type: [Object],
        default: []
    },
});

export default Propriety ;