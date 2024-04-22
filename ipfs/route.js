import { filesFromPaths } from 'files-from-path';
import * as Client from '@web3-storage/w3up-client';
import fs from 'fs';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import fetch from 'node-fetch';

const url = 'https://bafybeieblsymdlk5poldbxbwhoxjwi5l72a5fcjpjnl5w45kpnoul2ir34.ipfs.w3s.link/';
const outputFilePath = './output/file.zip';

const configPath = './config/config.json';
const rawData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(rawData);

export async function uploadZip(req,res)  {
 
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    console.log("fileContent", fileContent)

    const outputFilePath = "./output/"+ Date.now() + ".zip";
    console.log("outputFilePath", outputFilePath);

    // Encrypt the file content using AES encryption
    const encryptedContent = CryptoJS.AES.encrypt(fileContent, config.encryption.encrypt_key).toString();

    // Write the encrypted content to the output file
    fs.writeFileSync(outputFilePath, encryptedContent, 'utf8');

   console.log('File encrypted successfully.' );

    const client = await Client.create();
    console.log("client", client);
    const account = await client.login(config.storage.login_id);
    console.log("account", account);
    await client.setCurrentSpace(config.storage.space_did);
    const files = await filesFromPaths(outputFilePath);
    console.log("files", files);
    const cid = await client.uploadDirectory(files);
    console.log(`IPFS CID: ${cid}`)

    res.json({statusCode : 200, data : `${cid}`});
}

export async function downloadFile(req,res)  {

  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text();
  })
  .then(data => {
    fs.writeFileSync(outputFilePath, data);
    console.log(`File saved to ${outputFilePath}`);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
  //  // Read the encrypted contents of the file
  // const encryptedContent = fs.readFileSync(outputFilePath, 'utf8');

  //   // Decrypt the file content using AES decryption
  // const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, encryptionKey);
  // const decryptedContent = decryptedBytes.toString(CryptoJS.enc.Utf8);

  //  // Write the decrypted content to the output file
  //  fs.writeFileSync(decrypt, decryptedContent, 'utf8');
 
  //  console.log('File decrypted successfully.');

}


