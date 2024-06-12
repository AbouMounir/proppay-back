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
    proprietyImages: {
        type : String,
        default : ""
    },
    proprietyOccupation: {
        type: String,
        /* required: [true, "'Is a propriety' occupied is requiried"] */
    },
    proofOfPropriety: {
        type : String,
        default : ""
    },
    totalUnits: {
      type :   String,
      default : 0
    },
    occupiedUnits:  {
        type :   String,
        default : 0
      },
    availableUnits:  {
        type :   String,
        default : 0
      },
    listOfTenants:  [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tenants",
        default: [],
        },
    ],
    landLord:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "landlords",
        default: ""
    }
});

export default Propriety ;