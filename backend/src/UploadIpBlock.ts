import { ApiPromise, WsProvider } from "@polkadot/api";
import { BN, BN_ONE } from '@polkadot/util';
import { ContractPromise } from "@polkadot/api-contract";
import { Keyring } from "@polkadot/keyring";
import type { WeightV2 } from '@polkadot/types/interfaces';
import ConfigCache from "./ConfigCache";

export default class UploadIpBlock {

    private readonly config = new ConfigCache();

    async uploadIpblock(clientAuid: string, divisionAuid : string, designerAuid: string, fileHash: string, curationStatus: string, time_of_upload : string) {
        const provider = new WsProvider(this.config.getConfig().blockchain.provider);
        const contractAddress = this.config.getConfig().blockchain.contractAddress;
        
        const allValues = Object.values(this.config.getConfig().accounts);
        const randomIndex = Math.floor(Math.random() * allValues.length);
        const keyringValue = allValues[randomIndex];
        console.log("keyringValue",keyringValue);

        const api = await ApiPromise.create({provider});
        const metadata = this.config.getBlockchainMetadata();

        // created contract object
        const contract = new ContractPromise(api, metadata, contractAddress);

        //Import wallet
        const keyring = new Keyring({type: 'sr25519'});
        const alice = keyring.addFromUri(keyringValue);
        console.log("add", alice.address);

        //Made estimation
        const refTime2  = api.consts.system.blockWeights;
        let maxBlockRefTime, maxBlockproofSize;

        if ('maxBlock' in refTime2 && 'refTime' in (refTime2.maxBlock as any) && 'proofSize' in (refTime2.maxBlock as any)) {
            const _maxBlockRefTime = (refTime2.maxBlock as any).refTime;
            const _maxBlockproofSize = (refTime2.maxBlock as any).proofSize;
            console.log("REFTIME", _maxBlockRefTime.toHuman(),"proofSize",_maxBlockproofSize.toHuman());
            maxBlockRefTime = parseInt(_maxBlockRefTime.toHuman().replace(/,/g, ''));
            maxBlockproofSize = parseInt(_maxBlockproofSize.toHuman().replace(/,/g, ''));
        } else {
           console.error('maxBlock or refTime property does not exist');
        }
        const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
        const { gasRequired, storageDeposit, result} = await contract.query.uploadBlock(
            alice.address,
             {
               gasLimit: api.registry.createType('WeightV2', {
               refTime: maxBlockRefTime,
                //  proofSize : maxBlockproofSize,
              proofSize: MAX_CALL_WEIGHT
              }) as WeightV2,
             },clientAuid,divisionAuid,designerAuid,fileHash,curationStatus,time_of_upload);

        return new Promise((resolve, reject) => {
         // Error handling
        if (result.isErr) {
          let error = ''
          if (result.asErr.isModule) {
            const dispatchError = api.registry.findMetaError(result.asErr.asModule)
            console.log('error', dispatchError.name);
            error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name;
            reject(dispatchError.name);
          } else {
            error = result.asErr.toString()
        }
        console.log(error)
        reject(error);
      }

      if (result.isOk) {
        const flags = result.asOk.flags.toHuman()
        if (flags.includes('Revert')) {
          console.log('Revert')
          console.log(result.toHuman())
          reject("Error");
        }
      }
     
      try {
          const checkStatus = async (res) => {
              resolve(res.txHash.toHuman());
              return res.txHash.toHuman();
          };
          contract.tx.uploadBlock({
                  gasLimit: gasRequired as any as 2,
                  storageDepositLimit:  storageDeposit.isCharge ? storageDeposit.asCharge.toString() : null,
               },clientAuid,divisionAuid,designerAuid,fileHash,curationStatus,time_of_upload).signAndSend(alice, res => {
                  checkStatus(res);
               })
        } catch (error) {
                console.error('Error:', error);
                reject(error);
        }
      });
    }
}