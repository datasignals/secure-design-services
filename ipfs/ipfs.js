import { filesFromPaths } from 'files-from-path';
import { promisify } from 'util';
import fs from 'fs';
import { create } from 'ipfs-http-client';

const client = create("http://127.0.0.1:5001");

export async function uploadIpfsZip(req,res)   {
    const readFile = promisify(fs.readFile);
    console.log("path",req.file.path);
    const zipFolderContent = await readFile(req.file.path);
    const {cid} = await client.add(zipFolderContent);
    console.log(cid);
    res.json({"cid": cid});
}

export async function getFileFromIPFS(req, res) {
    try {
        const cid = req.body.cid;
        console.log("cid", cid);

        // Use promise to wait for ipfs.get to complete
       // const files = client.get("QmZsSHEFFkijpcbinbsY3DxrW75aaay1yZBZXWRvvhSZue");
       // const files = client.cat("QmbZmZcCbTeTdC7e4pDaxhCe9ehZTLrPgXAm5RodmHss3a");
        client.cat(cid, (ipfsError, files) => {
          console.log("files", files);
          if (ipfsError) {
            console.error('Error retrieving file from IPFS:', ipfsError);
            return;
          }
        
    // Iterate through each file in the result
    files.forEach((retrievedFile, index) => {
      // Do something with each file content, for example, save it to a local file
      const localFilePath = `/output/file_${index + 1}.zip`;
      fs.writeFile(localFilePath, retrievedFile.content, (writeError) => {
        if (writeError) {
          console.error(`Error saving file locally (${index + 1}):`, writeError);
          return;
        }
        console.log(`File ${index + 1} retrieved from IPFS and saved locally:`, localFilePath);
      });
    });
  })
    console.log("game over");
    } catch (error) {
        console.error('Error retrieving file from IPFS:', error.message);
    }
}
