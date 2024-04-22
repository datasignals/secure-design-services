// import path from "path";
// import fs from "fs";
import {Route} from "./Routes";
import Cors from "cors";
import Express from "express";
import bodyParser from "body-parser";
// import {MongoService} from "./MongoService";
import * as config from '../config/config.json';
import "./kafkaconnect";
export const blockchainConfig = config.blockchain;
export const mongoconfig = config.mongo;

//Init server
const app = Express()
//Port
const port = 3005
//CORS Middleware
app.use(Cors({credentials: true}));
app.use(bodyParser.json());

app.get("/contract/getchecksum",Route.Get.getChecksum)       //returns all checksum
app.get("/get-designer-file-records",Route.Get.designerFileRecords) //returns designer file records
app.get("/get-designer-file-records-timerange",Route.Get.designerFileRecordsTime)
app.listen(port, () => console.log(`File System Backend listening on port ${port}`));

