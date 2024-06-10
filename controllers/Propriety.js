import Landlord from "../models/Landlord.js";
import Propriety from "../models/Propriety.js";
import { uploadFieldName } from "./middleware/createOceanFolderMiddleware.js";

const addPropriety = (async (req, res) => {
    try {
        let proofOfPropriety;
        let proprietyImages;
        console.log(req.body)
        if(!Object.keys(req.body).length > 0){
            console.log("body is not empty");
        }else{
            console.log("body is empty");
        }
        // if(req.body.proofOfPropriety || req.body.proprietyImages){
        //     uploadFieldName('proprieties')(req, res, async function (err) {
        //         if (err) {
        //             console.error('Error uploading files to DigitalOcean Spaces:', err);
        //             // return res.status(500).send('Error uploading files to DigitalOcean Spaces');
        //         }
        //         // Files uploaded successfully
        //         proprietyImages = req.files['fieldName1'][0]?.location;
        //         proofOfPropriety = req.files['fieldName2'][0]?.location;
        //     });
        // }

        if(req.body.proofOfPropriety){
            proofOfPropriety =req.body.proofOfPropriety;
        }

        if(req.body.proprietyImages){
            proprietyImages = req.body.proprietyImages;
        }
        //copyFile('propay-storage/proprieties',req.files['fieldName2'][0].key,'propay-storage/preuves',req.files['fieldName2'][0].key)
        const obj = JSON.parse(JSON.stringify(req.body));
        console.log(obj);
        // Ajouter la propriété dans la base de données 'propriétés
        const propriety =  new Propriety({
            proprietyId: req.body.landlordNumber + '-' + req.body.proprietyName,
            proprietyName: req.body.proprietyName,
            proprietyAdress: req.body.proprietyAdress,
            proprietyType: req.body.proprietyType,
            proprietyImages: proprietyImages,
            proprietyOccupation: req.body.proprietyOccupation,
            proofOfPropriety: proofOfPropriety,
            totalUnits: req.body.totalUnits,
            occupiedUnits: req.body.occupiedUnits,
            availableUnits: req.body.availableUnits
        })
        await propriety.save()
        console.log(propriety);
        // Ajouter la propriété dans le champ 'listepropriety' du locataire
        /* const proprietyValeur = {
            proprietyName: req.body.proprietyName,
            proprietyAdress: req.body.proprietyAdress,
            proprietyType: req.body.proprietyType,
            proprietyImages: req.body.proprietyImages,
            proprietyOccupation: req.body.proprietyOccupation,
            PreuveDepropriety: req.body.PreuveDepropriety
        } */
        console.log(proofOfPropriety)
        console.log(proprietyImages)
        const proprietyId = req.body.landlordNumber + '-' + req.body.proprietyName
        const landlord = await Landlord.findOne({ landlordNumber: req.body.landlordNumber });
        if(landlord){
            landlord.listOfProprieties.push(proprietyId)
            await landlord.save();
            res.status(200).json({ message: 'Élément ajouté avec succès' });
        }else{
            res.status(404).json({ message: 'Landlord not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'élément' });
    }
})

const getProprieties = (async (req, res) => {
    await Propriety.find({}).then(item => res.send(item))
})

const getPropriety = (async (req, res) => {
    await Propriety.findOne({ _id: req.params.id }).then(item => res.send(item))
})

const deletePropriety = (async (req, res) => {
    try {
        const propriety = await Propriety.findById(req.params.id);
        const elt = propriety.proprietyId;
        const landlord = await Landlord.findOne({ landlordNumber: propriety.proprietyId.substr(0, 14) });
        if (!landlord) {
            return res.status(404).send('no user find')
        }
        const proprieties = landlord.listOfProprieties
        const newProprieties = proprieties.filter(proprietyId => proprietyId !== elt);
        landlord.listOfProprieties = newProprieties;
        await landlord.save();
        await Propriety.deleteOne({ _id: propriety._id.toString() })
        res.send("Propriety correctly removed")
    } catch (error) {
        console.log("error :"+error);
        res.send("Propriety not correctly removed" + error);
    }
})

export { addPropriety, deletePropriety, getProprieties, getPropriety };

