import Landlord from "../models/Landlord.js";
import Propriety from "../models/Propriety.js";
import { uploadFieldName } from "./middleware/createOceanFolderMiddleware.js";

const addPropriety = (async (req, res) => {
    try {
        let proofOfPropriety;
        let proprietyImages;
      
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
        // console.log(obj);
        // Ajouter la propriété dans la base de données 'propriétés
        const propriety =  new Propriety({
            // proprietyId: req.body.landlordNumber + '-' + req.body.proprietyName,
            proprietyName: req.body.proprietyName,
            proprietyAdress: req.body.proprietyAdress,
            proprietyType: req.body.proprietyType,
            proprietyImages: req.body.proprietyImages,
            proprietyOccupation: req.body.proprietyOccupation,
            proofOfPropriety: req.body.proofOfPropriety,
            totalUnits: req.body.totalUnits,
            occupiedUnits: req.body.occupiedUnits,
            availableUnits: req.body.availableUnits,
            landLord : req.userId
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
        
        // const proprietyId = req.body.landlordNumber + '-' + req.body.proprietyName
        const landlord = await Landlord.findOne({ _id: req.userId });
        if(landlord){
            if (!landlord.listOfProprieties) {
                landlord.listOfProprieties = [];
            }
            landlord.listOfProprieties.push(propriety._id);
            await landlord.save();
            res.status(200).json({ message: 'Élément ajouté avec succès', data : propriety });
        }else{
            res.status(404).json({ message: 'Landlord not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'élément' });
    }
})


const updatePropriety = async (req, res) => {
    try {
        let proofOfPropriety;
        let proprietyImages;
        console.log(req.body);

        if (req.body.proofOfPropriety) {
            proofOfPropriety = req.body.proofOfPropriety;
        }

        if (req.body.proprietyImages) {
            proprietyImages = req.body.proprietyImages;
        }

        const obj = JSON.parse(JSON.stringify(req.body));
        console.log(obj);

        const proprietyId = req.params.id;

        // Rechercher l'immeuble par ID
        const propriety = await Propriety.findById(proprietyId);
        if (!propriety) {
            return res.status(404).json({ message: 'Immeuble non trouvé' });
        }

        // Mettre à jour les champs de l'immeuble
        propriety.proprietyName = req.body.proprietyName || propriety.proprietyName;
        propriety.proprietyAdress = req.body.proprietyAdress || propriety.proprietyAdress;
        propriety.proprietyType = req.body.proprietyType || propriety.proprietyType;
        propriety.proprietyImages = proprietyImages || propriety.proprietyImages;
        propriety.proprietyOccupation = req.body.proprietyOccupation || propriety.proprietyOccupation;
        propriety.proofOfPropriety = proofOfPropriety || propriety.proofOfPropriety;
        propriety.totalUnits = req.body.totalUnits || propriety.totalUnits;
        propriety.occupiedUnits = req.body.occupiedUnits || propriety.occupiedUnits;
        propriety.availableUnits = req.body.availableUnits || propriety.availableUnits;

        await propriety.save();
        console.log(propriety);

        res.status(200).json({ message: 'Élément mis à jour avec succès', propriety });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élément' });
    }
}


const getProprieties = (async (req, res) => {
    await Propriety.find({}).then(item => res.send(item))
})

const getPropriety = (async (req, res) => {
    await Propriety.findOne({ _id: req.params.id }).populate({"path" : "listOfTenants"}).then(item => res.send(item))
})

const deletePropriety = (async (req, res) => {
    try {
        const propriety = await Propriety.findById(req.params.id);
        if(!propriety){
            return res.status(404).json({error : "Property not found"});
        }
        const landlord = await Landlord.findById(propriety.landLord);
        if (!landlord) {
            return res.status(404).json({error : "landLord not found"});
        }
        const proprieties = landlord.listOfProprieties
        const newProprieties = proprieties.filter(proprietyId => proprietyId !== req.params.id);
        landlord.listOfProprieties = newProprieties;
        await landlord.save();
        await Propriety.deleteOne({ _id: propriety._id.toString() })
        res.json({success : true, message : "Propriety correctly removed"});
    } catch (error) {
        console.log("error :"+error);
        res.json({ error: error.message});
    }
})

export { addPropriety, deletePropriety, getProprieties, getPropriety, updatePropriety };

