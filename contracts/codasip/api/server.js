const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());
app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    response.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
    next();
});

const port = process.env.port || 8900;
console.log("server is running", port);
app.listen(port);


const {ContractPromise} = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const provider = new WsProvider("wss://rpc.shibuya.astar.network");

//contract details
const metadata = require("./metadata.json");
const contract_address = "bdLpQR37k2PLU8AzUz1LUjxALDbXskTtj65sWbCRCfsxYrP"

const Web3 = require("w")



// const getAccounts = async () => {
//   const api = await ApiPromise.create({ provider });
//   const addresses = await api.query.system.account.entries();
//   console.log("addresses", addresses);
//   const accounts = addresses.map(([accountId, _]) => accountId.toHuman());
//   console.log(accounts);
//   return accounts;
// };
// getAccounts();

// // Add  client function

// const addClient = async (req,res)  =>  {
//   const api = await ApiPromise.create({ provider });
//   const contract = new ContractPromise(api, metadata, contract_address);

//   const keyring = new Keyring({type : "sr25519"});
//   const alice = keyring.addFromUri("collect drink number filter advice grace egg lunar beef brave combine clever");
//   console.log("add", alice.address);

//  //const gasLimit = 100000000000000n; // Adjust this to an appropriate value
//   //const gas = 18626900000000000; // Adjust this to an appropriate value


//   const clientAuid = 'client_002';
//   const divisions = [{
//     division_auid: 'division_001',
//     name: 'division1',
//     available: [],
//     designers: []
//   }];

//   const storageDepositLimit = 50000;

//   var gas = contract.tx.addClient(clientAuid, divisions, "");
//   const { weight, class: feeClass, partialFee } = await gas.paymentInfo(alice.address);
//   console.log("feeEstimate", partialFee.toHuman());
//   const gasLimit = 957308485056000n; // Adjust the gas limit as needed

//   //console.log("final",totalFeeInDOT);
//   try {
//     const result = await contract.tx.addClient(clientAuid,divisions,"",).signAndSend(alice, {gasLimit});
//     // console.log("result", result.toHuman());
//     // const result = await contract.methods.addClient(clientAuid, divisions, "").signAndSend({
//     //   from: alice.address,
//     // });
//     console.log(result.isInBlock);
//     if (result.isInBlock) {
//       console.log('Transaction included in block:', result.toHuman());
//     } else if (result.isFinalized) {
//       console.log('Transaction finalized:', result.toHuman());
//     } else {
//       console.error('Transaction failed:', result.toHuman());
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }

// }


// addClient();



// // Add division function

// const addDivision = async (req,res)  =>  {
//   const api = await ApiPromise.create({ provider });
//   const contract = new ContractPromise(api, metadata, contract_address);

//   const keyring = new Keyring({type : "sr25519"});
//   const alice = keyring.addFromUri("//Alice");
//   console.log("add", alice.address);
  
//   const gasLimit = 1500000000n; // Adjust the gas limit as needed

//   const division_auid = 'div_001';
//   const name = "inida";
//   const available = [{
//     ipblock_auid: "",
//     name: "",
//     version: "",
//     releaseDate: ""
//   }];
//   const designers = [{
//     designer_auid : "",
//     division : "",
//   }]
//   try {
//     const result = await contract.tx.addDivision(division_auid,name,available,designers,"").signAndSend(alice, {gas : gasLimit});
//     console.log("result", result.toHuman());
//     console.log(result.isInBlock);
//     if (result.isInBlock) {
//       console.log('Transaction included in block:', result.toHuman());
//     } else if (result.isFinalized) {
//       console.log('Transaction finalized:', result.toHuman());
//     } else {
//       console.error('Transaction failed:', result.toHuman());
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }

// }


// //addDivision();



// // Add ipblock function

// const addIpBlock = async (req,res)  =>  {
//   const api = await ApiPromise.create({ provider });
//   const contract = new ContractPromise(api, metadata, contract_address);

//   const keyring = new Keyring({type : "sr25519"});
//   const alice = keyring.addFromUri("//Alice");
//   console.log("add", alice.address);
  
//   const gasLimit = 1500000000n; // Adjust the gas limit as needed

//   const ipblock_auid = 'div_001';
//   const name = "inida";
//   const version = "";
//   const releaseDate = "";

//   try {
//     const result = await contract.tx.addIpblock(ipblock_auid,name,version,releaseDate,"").signAndSend(alice, {gas : gasLimit});
//     console.log("result", result.toHuman());
//     console.log(result.isInBlock);
//     if (result.isInBlock) {
//       console.log('Transaction included in block:', result.toHuman());
//     } else if (result.isFinalized) {
//       console.log('Transaction finalized:', result.toHuman());
//     } else {
//       console.error('Transaction failed:', result.toHuman());
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }

// }


// //addIpBlock();


// const purchaseRecord = async ()  =>  {
//   const api = await ApiPromise.create({ provider });
//   const contract = new ContractPromise(api, metadata, contract_address);
//   const keyring = new Keyring({ type: 'sr25519' });
//   //console.log("contract", contract.tx);
//   const alice = keyring.addFromUri("collect drink number filter advice grace egg lunar beef brave combine clever");
//   console.log("add", alice.address);
//   const gasLimit = 15000000n; // Adjust the gas limit as needed

//   var client = "apple";
//   var division = "india";
//   var designer = "mark";
//   var ipblockname = "codasip_uiisc_v";
//   var ipblockversion = "1.0.2";

//   try {
//     const result = await contract.tx.purchase(client , division, designer, ipblockname, ipblockversion,{
//       gasLimit,
//     }).signAndSend(alice);

//     console.log("result", result.toHuman());
//     console.log(result.isInBlock);
//     if (result.isInBlock) {
//       console.log('Transaction included in block:', result.toHuman());
//     } else if (result.isFinalized) {
//       console.log('Transaction finalized:', result.toHuman());
//     } else {
//       console.error('Transaction failed:', result.toHuman());
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }


// }

// purchaseRecord();