import express from "express";
const app = express();

import bodyParser from "body-parser";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

import cors from "cors";
app.use(cors());

app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT");
  next();
});

//CORS Middleware
app.use(cors({credentials: true}));
app.use(bodyParser.json());

import Multer from "multer";
import path from "path";

//Upload Middleware
const storage = Multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './output');
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname)
  }
});

//Upload Storage reference
const upload = Multer({storage: storage/*, fileFilter: fileFilter*/});

//Port
const port = 3007;
app.listen(port, () => console.log(`File System Backend listening on port ${port}`));



import * as api from "./route.js";

app.post("/api/uploadZip",upload.single("zip"), api.uploadZip);
app.get("/api/downloadFile", api.downloadFile);

import * as ipfs from "./ipfs.js";

app.post("/api/uploadIpfsZip", upload.single("zip"), ipfs.uploadIpfsZip);
app.post("/api/getFileFromIPFS", ipfs.getFileFromIPFS);

































// import { promisify } from 'util';
// import fs from 'fs';
// import { create } from 'ipfs-http-client';

// // // connect to the default API address http://localhost:5001
// const client = create("http://127.0.0.1:5001");

// // // Promisify the fs.readFile function
// const readFile = promisify(fs.readFile);
// // // Read the content of the zip folder
// const zipFolderContent = await readFile("./merry.txt");
// const { cid } = await client.add(zipFolderContent);


// // // // client.
// console.log("cid", cid);














// import { createHelia } from 'helia';
// import { unixfs } from '@helia/unixfs';


// async function createNode()  {
//   const helia = await createHelia();
//   console.log("helia", helia);
//   const fs = unixfs(helia)
//   console.log("fs",fs);
//   return fs;
// }

// async function uploadZip() { 
// const fs = await createNode();
// const emptyDirCid = await fs.addDirectory()
// const fileCid = await fs.addBytes(Uint8Array.from([0, 1, 2, 3]))
// const updateDirCid = await fs.cp(fileCid, emptyDirCid, 'merry.txt')

// // or doing the same thing as a stream
// for await (const entry of fs.addAll([{
//   path: 'data.txt',
//   content: Uint8Array.from([0, 1, 2, 3])
// }])) {
//   console.info(entry)
// }
// }
// uploadZip();
// create an empty dir and a file, then add the file to the dir
// const emptyDirCid = await fs.addDirectory()
// const fileCid = await fs.addBytes(Uint8Array.from([0, 1, 2, 3]))
// const updateDirCid = await fs.cp(fileCid, emptyDirCid, '/foo.txt')

// or doing the same thing as a stream
// for await (const entry of fs.addAll([{
//   path: 'foo.txt',
//   content: Uint8Array.from([0, 1, 2, 3])
// }])) {
//   console.info(entry)
// }