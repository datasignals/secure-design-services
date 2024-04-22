

const {ContractPromise} = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const provider = new WsProvider('wss://rococo-contracts-rpc.polkadot.io');

const metadata = require("./metadata.json");
const contract_address = "5EDN4Zz2tyw8AKHmo9f7L8ihJTo2Ptu48C3bTNNoDzNK7yCj";


const purchaseRecord = async ()  =>  {
  const api = await ApiPromise.create({ provider });
  const contract = new ContractPromise(api, metadata, contract_address);
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri("collect drink number filter advice grace egg lunar beef brave combine clever");
  console.log("add", alice.address);
  const gasLimit = 15000000n; // Adjust the gas limit as needed

  var client = "apple";
  var division = "india";
  var designer = "mark";
  var ipblockname = "codasip_uiisc_v";
  var ipblockversion = "1.0.2";

  try {
    const result = await contract.tx.purchase(client , division, designer, ipblockname, ipblockversion,{
      gasLimit,
    }).signAndSend(alice);

    console.log("result", result.toHuman());
    console.log(result.isInBlock);
    if (result.isInBlock) {
      console.log('Transaction included in block:', result.toHuman());
    } else if (result.isFinalized) {
      console.log('Transaction finalized:', result.toHuman());
    } else {
      console.error('Transaction failed:', result.toHuman());
    }
  } catch (error) {
    console.error('Error:', error);
  }


}

purchaseRecord();
