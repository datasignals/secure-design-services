// import KeycloakService from "./KeycloakService";
import Multer from "multer"
import path from "path";
import fs from "fs";
import {Route} from "./Routes";
import Cors from "cors";
import Express from "express";
import bodyParser from "body-parser";
import ConfigCache, {Config} from "./ConfigCache";
import {MongoService} from "./MongoService";
// import CompanyStorage from "./CompanyStorage";
import CompanyData from "./common/CompanyData";
import { Binary } from "mongodb";
import sizeOf from "image-size";

//Init server
const app = Express()
//Port
const port = 3001
//CORS Middleware
app.use(Cors({credentials: true}));
app.use(bodyParser.json());
//TMP Folder for PDFs
fs.mkdirSync("/tmp/ps-consent-management/files", {recursive: true})


// export async function runWithRetry(fn: () => Promise<void>, interval: number = 10000, maxRetries: number = 9999): Promise<void> {
//     let retries = 0;

//     async function executeFunction() {
//         try {
//             await fn();
//             // If the function succeeds, clear the interval
//             clearInterval(retryInterval);
//         } catch (error) {
//             console.error(`Error occurred: ${error.message}`);
//             retries++;

//             if (retries >= maxRetries) {
//                 console.error(`Maximum number of retries reached. Exiting.`);
//                 clearInterval(retryInterval);
//             }
//         }
//     }

//     // Initial attempt
//     await executeFunction();

//     // Set up an interval to retry the function
//     const retryInterval = setInterval(async () => {
//         await executeFunction();
//     }, interval);
// }


//Auth Keycloak
// runWithRetry(KeycloakService.getInstance().performKeycloakAuth)
//     .then(() =>
//         console.log("Keycloak Authentication Completed")
//     )
//     .catch(r => console.error("Keycloak Authentication has Failed: " + r.toString()))

//Auth Keycloak
// KeycloakService.getInstance().performKeycloakAuth().then(() => {
//     console.log("Keycloak Authentication Completed");
// }).catch(r => {
//     console.error("Keycloak Authentication has Failed: " + r.toString());
// });

//Upload Middleware
const storage = Multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/ps-consent-management/files');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/svg+xml"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only SVG files are allowed."), false);
    }
};

//Upload Storage reference
const upload = Multer({storage: storage/*, fileFilter: fileFilter*/});

app.use('/assets', Express.static(path.join(__dirname, 'assets')));


app.post("/create-company", upload.single("svg+xml"), Route.Get.createCompany); // This API is called on add client
// app.get("/get-company-image", Route.Get.getCompanyImage);
app.get("/get-company-data", Route.Get.getCompanyData);
app.get("/get-companies", Route.Get.getAllCompanies);
app.get("/get-groups", Route.Get.getAllGroups);

// Upload PDF
// app.post("/send-pdf", upload.single("pdf"), Route.Get.sendPdf);
// Check if document is signed
app.get("/document-signed", Route.Get.documentSigned);
// Email service
//TODO we no longer need route for that
// app.get("/send-email", Route.Get.sendEmail);
//Batch Management
app.get("/create-batch", Route.Get.createConsentBatch);

//TODO delete if we don't update batches and only create new ones
// app.get("/update-batch", (req, res) => routes.updateConsentBatchRoute(req, res));
app.get("/list-batches", Route.Get.listBatches);
app.post("/revoke-user-consent", Route.Get.revokeUserConsent);
app.get("/get-batch", Route.Get.getBatch);
app.get("/get-group-user-belongs", Route.Get.getGroupUserBelongsTo);

//TODO fix this upload.any() into upload.single(pdf)
// getting some errors if I try it
app.post("/upload-doc", upload.any(), Route.Get.uploadDoc);
app.get("/get-documents", Route.Get.getDocuments);
app.get("/get-document", Route.Get.getDocument);
app.get("/get-signature", Route.Get.getSignatures);
app.post("/put-signature", Route.Get.putSignature);
app.get("/list-users", Route.Get.listUsers);
app.get("/create-user", Route.Get.createUser); // created new designser for client
app.get("/find-username", Route.Get.findUsername);
app.get("/find-email", Route.Get.findEmail);
app.get("/delete-user", Route.Get.deleteUser);
app.get("/get-companies-associated-with-client", Route.Get.getCompaniesAssociatedWithClient)
app.post("/edit-existing-user", Route.Get.editExistingUser);
app.get("/get-existing-divisions", Route.Get.getExistingDivisions);
app.get("/get-available-divisions", Route.Get.getAvailableDivisions);
app.get("/get-available-roles", Route.Get.getAvailableRoles);
app.get("/mongo/ipblock", Route.Get.getUserIpBlocksFromMongo);
app.get("/mongo/ipblock/purchase", Route.Get.purchaseAndDownloadIpBlock); // designer download and purchase
app.get("/mongo/ipblock/download", Route.Get.downloadIpBlock); // designer download only (unsafe)
app.get("/mongo/ipblock/valid", Route.Get.isIpBlockValid)
app.get("/contract/division", Route.Get.getDivisionsBelongingToCompany);
app.get("/artifactory/ipblock/properties", Route.Get.getIpBlockPropertiesBelongingToUser);
app.get("/artifactory/ipblock/properties/all", Route.Get.getIpBlockProperties);
//TODO finish
app.get("/artifactory/ipblock/curation/all", Route.Get.getIpBlocksForCuration);

app.post("/artifactory/ipblock/curation/approve", Route.Post.approveIpblockForCuration);
app.post("/artifactory/ipblock/curation/reject", Route.Post.rejectIpblockForCuration);

app.post("/mongo/division/add", Route.Post.postAddIpBlockToDivision); // add Ipblock
app.post("/contract/add", Route.Post.createContract)  // add client API
app.post("/contract/division/add", Route.Post.addDivision) // add division API
app.post("/contract/division/remove", Route.Post.removeDivision)
app.get("/contract/exists", Route.Get.contractExists)
app.get("/find-user", Route.Get.getUserFromEmail)
app.get("/license", Route.Get.getLicenseOk)

app.get("/assets/company/test/:companyName", Route.Get.getAsset)

app.post("/indie/ipblock/upload", upload.single("zip"), Route.Post.uploadIndieIpBlock) // upload Ipblock by indie developers
app.post("/indie/user/create", Route.Post.createIndieUser) // Third party designers registration

app.get("/version", Route.Get.getBackendVersion)
app.get("/debug", Route.Get.getDebug)



app.listen(port, () => console.log(`Contract Managemenet Backend listening on port ${port}`));
