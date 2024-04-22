import { collections } from "./MongoService";
import {MongoService} from "./MongoService";
import { ObjectId } from "mongodb";
import * as crypto from 'crypto';
import GetChecksum from "./GetChecksum";

const mongooseService = MongoService.getInstance();

export default class DesignerFileRecords{
    async designerFileRecords(designerName: string){
        try {
            await mongooseService.connect();
            console.log("DESIGNERNAME IN FILE",typeof(designerName))
            const result = collections.FileSystemRecords?.aggregate([
                {
                    $unwind: "$Filerecords"
                  },
                  {
                    $match: {
                      "Filerecords.designerName":designerName
                    }
                  },
                  // {
                  //   $sort: {
                  //     "Filerecords.timestamp": -1
                  //   }
                  // },
                  {
                    $group: {
                      _id: "$_id",
                      Filerecords: { $push: "$Filerecords" },
                      checksum: { $first: "$checksum" },
                      blockchainHash: { $first: "$blockchainHash" },
                    }
                  },
                  { $sort: { "Filerecords.timestamp": -1 } }
                ]).toArray();
                console.log("RESULT",result)
                if (!result || (await result).length === 0) {
                  return  [] ; // Return empty arrays if no result
            }
            const ids = (await result || []).map((item) => item._id);

            // Use the _id values to fetch the full documents
            const fullData = await collections.FileSystemRecords?.find({ _id: { $in: ids as ObjectId[] } }).toArray();
            
            // Check MD5 hash for each record and append the result array
            const resultWithChecksumMatch = await Promise.all ((await result).map(async(record) => {
              const fullRecord = fullData?.find((fullRecord) => fullRecord._id.equals(record._id));
              if (fullRecord) {
                // console.log("CHECK RECORDS",fullRecord.Filerecords)
                const calculatedChecksum = this.calculateMD5(fullRecord.Filerecords);
                // console.log("CALCULATED CHECKSUM",calculatedChecksum)
                // console.log("MONGO CHECKSUM",record.checksum)
                let checksumMatch = calculatedChecksum === record.checksum;
                if(checksumMatch == true){
                  console.log("INSIDE CHECKSUM TRUE")
                  const checksums: any = await new GetChecksum().getChecksum();
                  // console.log("BLOCKCHAIN CHECKSUMS",checksums.Ok)
                  for (const blockchainChecksum of checksums.Ok) {
                    if(checksumMatch = blockchainChecksum === record.checksum){
                      console.log(blockchainChecksum,"..",record.checksum)
                      return { ...record, checksumMatch };
                    }
                  }
                }  
                return { ...record, checksumMatch };
              }
              return record;
            }));
            return resultWithChecksumMatch
          // return { result: resultWithChecksumMatch, fullData };
        
        }
        catch (error) {
            console.error("Error fetching designer file records:", error);
            throw error; // Rethrow the error to propagate it further
        } 
    }
     async designerFileRecordsTime(designerName: string, fromDate: string, toDate: string){
        try {
          const fromDateEpoch = new Date(fromDate).getTime();
          const toDateEpoch = new Date(toDate).getTime();
          // console.log("FROM DATE",fromDateEpoch)
          // console.log("TO DATE",toDateEpoch)
            await mongooseService.connect();
           
            // console.log("DESIGNERNAME IN FILE",typeof(designerName))
            const result = collections.FileSystemRecords?.aggregate([
                {
                    $unwind: "$Filerecords"
                  },
                  {
                    $match: {
                      "Filerecords.designerName":designerName,
                      "Filerecords.timestamp": {
                        $gte: fromDateEpoch, // Replace with your start timestamp
                        $lte: toDateEpoch  // Replace with your end timestamp
                      }
                    }
                  },
                  // {
                  //   $sort: {
                  //     "Filerecords.timestamp": -1
                  //   }
                  // },
                  {
                    $group: {
                      _id: "$_id",
                      Filerecords: { $push: "$Filerecords" },
                      checksum: { $first: "$checksum" },
                      blockchainHash: { $first: "$blockchainHash" },
                    }
                  },
                  { $sort: { "Filerecords.timestamp": -1 } }
                ]).toArray();
            if (!result || (await result).length === 0) {
                  return []; // Return empty arrays if no result
            }
            const ids = (await result || []).map((item) => item._id);

            // Use the _id values to fetch the full documents
            const fullData = await collections.FileSystemRecords?.find({ _id: { $in: ids as ObjectId[] } }).toArray();
            
            // Check MD5 hash for each record and append the result array
            const resultWithChecksumMatch = await Promise.all ((await result).map(async(record) => {
              const fullRecord = fullData?.find((fullRecord) => fullRecord._id.equals(record._id));
              if (fullRecord) {
                // console.log("CHECK RECORDS",fullRecord.Filerecords)
                const calculatedChecksum = this.calculateMD5(fullRecord.Filerecords);
                // console.log("CALCULATED CHECKSUM",calculatedChecksum)
                // console.log("MONGO CHECKSUM",record.checksum)
                let checksumMatch = calculatedChecksum === record.checksum;
                
                if(checksumMatch === true){
                  // console.log("INSIDE CHECKSUM TRUE")
                  const checksums:any = await new GetChecksum().getChecksum();
                  // console.log("BLOCKCHIN",typeof(checksums));
                  for (const blockchainChecksum of checksums.Ok) {
                    if(checksumMatch = blockchainChecksum === record.checksum){
                      return { ...record, checksumMatch };
                    }
                  }
                }  
                return { ...record, checksumMatch };
              }
              return record;
            }));
            return resultWithChecksumMatch
          // return { result: resultWithChecksumMatch, fullData };
        }
        catch (error) {
            console.error("Error fetching designer file records:", error);
            throw error; // Rethrow the error to propagate it further
        } 

    }
    calculateMD5(fileRecords: any[]): string {
      const md5sum = crypto.createHash('md5');
      const result = md5sum.update(JSON.stringify(fileRecords));
      // const buffer = fileRecords.forEach((record) => {
      //   console.log("IN MD5",record);
      //   const combinedData = JSON.stringify(record);
      //   console.log("BUFFER",combinedData)
      // });
      return md5sum.digest('hex');
      // return 'YESS'
    }
}

