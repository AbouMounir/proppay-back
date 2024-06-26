import chromium from "@sparticuz/chromium-min";
import dotenv from 'dotenv';
import puppeteer from "puppeteer-core";
import stream from "stream";
import { s3 } from "./createOceanFolderMiddleware.js";

dotenv.config({ path: './../../config/.env' })

export async function generateAndUploadPDF(template, data, num) {


    try {
    const chromiumPack = "https://github.com/AbouMounir/proppay-back/releases/download/v1.0.1/chromium-v123.0.1-pack.tar"

    // ici j'ai un bug mismatch : j'ai checké sur le net plusieurs personnes ont ce soucis, je ne sais pas comment tu avais fait et ça fonctionnait
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(chromiumPack),
        headless: chromium.headless,
    });

    console.log(browser)

    const page = await browser.newPage();
    // Remplacer les variables dans le template HTML
    let html = template;
    Object.keys(data).forEach(key => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });
    // Charger le contenu HTML dans la page
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    // Générer le PDF en mémoire    
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    // Créer un Readable Stream à partir du buffer
    const readStream = new stream.PassThrough();
    readStream.end(pdfBuffer)
    // Paramètres de l'upload vers DigitalOcean Spaces
    const params = {
        Bucket: `${process.env.BUCKET}/factures`, // Remplacez par le nom de votre espace
        Key: `template${num}.pdf`, // Nom du fichier sur l'espace
        Body: readStream,
        ACL: 'public-read', // Ou autre permission selon vos besoins
        ContentType: 'application/pdf' // Type MIME du fichier
    };
    // Upload vers DigitalOcean Spaces
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Erreur lors de l\'upload:', err);
                reject(err);
            } else {
                console.log(`Fichier uploadé avec succès: ${data.Location}`);
                resolve(data.Location);
            }
        });
    });
    }catch(err) {
        console.log(err);
        return err;
    
    }
}
