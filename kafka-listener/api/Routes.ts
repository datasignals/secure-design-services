import {Request, Response} from "express";
import * as crypto from 'crypto';
import {MongoService} from "./MongoService";
import AddChecksum from "./AddChecksum";
import GetChecksum from "./GetChecksum";
import DesignerFileRecords from "./DesignerFileRecords"

import { FileSystemRecords } from "./common/FileSystemRecords";
import { collections } from "./MongoService";

export namespace Route{
    const mongooseService = MongoService.getInstance();

    export namespace Post{

    }

    export namespace Get{
        export async function getChecksum(req: Request, res: Response) {
            const contractExists = true;
            if (contractExists == true) {
                //INVOKE BLOCKCHAIN
                const checksums = await new GetChecksum().getChecksum();
                console.log("blockchainHash", checksums);
                res.send(checksums)
            } else {
                //TODO handle transaction part and revert changes, needs command pattern I think
                console.log("contract Doesnt Exist")
                res.sendStatus(500);
            }
    
        }
        export async function designerFileRecords(req: Request, res: Response) {
            const designerName = req.query["designerName"]?.toString()
            console.log("DesignerName",designerName)
            if(designerName){
                const records = await new DesignerFileRecords().designerFileRecords(designerName)
                res.send(records)
            }
            }

        export async function designerFileRecordsTime(req: Request, res: Response){
            const designerName = req.query["designerName"]?.toString()
            const fromDate = req.query["fromDate"]?.toString()
            const toDate = req.query["toDate"]?.toString()
            console.log("DesignerName",designerName)
            if(designerName && fromDate && toDate){
                const records = await new DesignerFileRecords().designerFileRecordsTime(designerName,fromDate, toDate)
                res.send(records)
            }
        }
    }
}

