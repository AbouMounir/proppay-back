import 'form-data';
import fs from 'fs';
import mimeTypes from 'mime-types';
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import Image from '../models/Image.js';
import { uploadDo } from './middleware/createOceanFolderMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurations Multer pour le stockage des fichiers temporaires
const storage = multer.memoryStorage(
    {
        destination: function (req, file, cb) {
            cb(null, 'tmp/uploads');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });

//export const upload = multer({ storage: storage });

const postImage = (async (req, res) => {
    try {
        await uploadDo('facture', 'factures')(req, res, async function (error) {
            if (error) {
                console.log(error);
            }
            console.log(req.file);
            const image = new Image({
                image: req.file.location
            })
            await image.save()
        })
        /* const imageFile = req.files['images'][0];
        const pdfFile = req.files['pdfs'][0];
        const { title, description } = req.body;

        const tmpFile = tmp.fileSync();
        fs.writeFileSync(tmpFile.name, imageFile.buffer);
        fs.writeFileSync(tmpFile.name, pdfFile.buffer);

        console.log(req.files);
        const image = new Image({
            image: {
                imagePath: imageFile.originalname,
                data: imageFile.buffer,
            },
            pdf: {
                pdfPath: pdfFile.originalname,
                data: pdfFile.buffer,
            },
            title: title,
            description: description
        }); */

        res.status(201).json({
            message: 'Image et données téléchargées avec succès.',
        })

    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du téléchargement de l\'image et des données.');
    }
});

const postImage1 = (async () => {
    try {
        const form = new FormData();

        // read the file and append into the FormData instance.
        const filepath = path.join(__dirname, '../mypdf.pdf');
        form.append("file", fs.createReadStream(filepath));
        console.log(form);
        console.log("--------------------------------");
        // Call the middleware to upload the file.
        await new Promise((resolve, reject) => {
            uploadDo('facture', 'factures')(form, function (error) {
                console.log(form);
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
        console.log("filllllllllllllllllllllllllllle");
    } catch (error) {
        console.error(error);
    }
});

const getImage = (async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).send('Image non trouvée.');
        }

        // Utilisez l'extension du fichier pour déterminer le type MIME
        const fileExtension = path.extname(image.imagePath).slice(1);
        const mimeType = mimeTypes.lookup(fileExtension) || 'application/octet-stream';

        res.set('Content-Type', mimeType); // Assurez-vous de définir le type MIME approprié

        res.send(image);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de l\'image.');
    }
});


export { getImage, postImage };

