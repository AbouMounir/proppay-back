import aws from "aws-sdk";
import dotenv from 'dotenv';
import multer from "multer";
import multerS3 from "multer-s3";

dotenv.config({ path: './../../config/.env' })

var limits = {
    files:2,
    fileSize: 1024 * 1024 * 10
}
const spacesEndpoint = new aws.Endpoint('ams3.digitaloceanspaces.com'); // Mettez à jour avec la région de votre Space
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});

const uploadDo = (fieldName, bucketName) => multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.BUCKET}/${bucketName}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
            
    }),
}).single(fieldName);

const upload = (fieldName, bucketName) => multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.BUCKET}/${bucketName}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: async function (req, file, cb) {
            /* console.log(req.body);
            const user = await Landlord.findOne({ landlordNumber: req.body.landlordNumber });
            console.log(user);
            if (!user) {
                console.log("user n'existe pas");
                return cb(new Error("user n'existe pas"));
            } else {
                cb(null, Date.now().toString() + '-' + file.originalname);
            } */
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    }),

}).single(fieldName);

const uploadFieldName = (bucketName) => multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.BUCKET}/${bucketName}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
}).fields([{ name: "fieldName1", maxCount: 1 }, { name: "fieldName2", maxCount: 1 }]);

const deleteFile = (bucketName, fileName) => {
    const params = {
        Bucket: bucketName,
        Key: fileName
    };

    s3.deleteObject(params, (err, data) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('File deleted successfully:', data);
        }
    });
};

const copyFile = (sourceBucket, sourceKey, destinationBucket, destinationKey) => {

    const params = {
        Bucket: destinationBucket,
        CopySource: `${sourceBucket}/${encodeURIComponent(sourceKey)}`,
        Key: destinationKey
    }
    s3.copyObject(params, function (err, data) {
        if (err) {
            console.error('Error copying file:', err);
        } else {
            console.log('File copied successfully:', data);
        }
    });
};

export { copyFile, deleteFile, s3, spacesEndpoint, upload, uploadDo, uploadFieldName };

