import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Keyring } from "@polkadot/keyring";
import type { WeightV2 } from '@polkadot/types/interfaces';
import { BN, BN_ONE } from '@polkadot/util';
import { blockchainConfig } from './index';
import metadata from "../blockchain/metadata.json"


export default class AddChecksum{
   
    async addChecksum(checksum:string){
        const provider = new WsProvider(blockchainConfig.provider);
        const contractAddress = blockchainConfig.contractAddress;
        const keyringValue = blockchainConfig.keyring;

        const api = await ApiPromise.create({provider});

        // created contract object
        const contract = new ContractPromise(api, metadata, contractAddress);

        //Import wallet
        const keyring = new Keyring({type: 'sr25519'});
        const alice = keyring.addFromUri(keyringValue);

        //Made estimation
        const refTime2  = api.consts.system.blockWeights;
        let maxBlockRefTime, maxBlockproofSize;
        const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
        if ('maxBlock' in refTime2 && 'refTime' in (refTime2.maxBlock as any) && 'proofSize' in (refTime2.maxBlock as any)) {
            const _maxBlockRefTime = (refTime2.maxBlock as any).refTime;
            const _maxBlockproofSize = (refTime2.maxBlock as any).proofSize;
            maxBlockRefTime = parseInt(_maxBlockRefTime.toHuman().replace(/,/g, ''));
            maxBlockproofSize = parseInt(_maxBlockproofSize.toHuman().replace(/,/g, ''));
            // console.log("maxBlockproofSize:", maxBlockproofSize);

        } else {
           console.error('maxBlock or refTime property does not exist');
        }
        
        const { gasRequired, storageDeposit, result} = await contract.query.pushHash(
            alice.address,
             {
               gasLimit: api.registry.createType('WeightV2', {
               refTime: maxBlockRefTime,
            //    proofSize : maxBlockproofSize,
               proofSize: MAX_CALL_WEIGHT
              }) as WeightV2,
             },checksum);

        return new Promise((resolve, reject) => {
         // Error handling
            if (result.isErr) {
                let error = ''
                if (result.asErr.isModule) {
                    const dispatchError = api.registry.findMetaError(result.asErr.asModule)
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
                    reject("Error");
                 }
            }
     
            try {
                const checkStatus = async (res:any) => {
                    resolve(res.txHash.toHuman());
                    // console.log("Return",res.txHash.toHuman())
                    return res.txHash.toHuman();
                };
                contract.tx.pushHash({
                  gasLimit: gasRequired,
                  storageDepositLimit:  storageDeposit.isCharge ? storageDeposit.asCharge.toString() : null,
                },checksum).signAndSend(alice, res => {
                  checkStatus(res);
                })
                } catch (error) {
                    console.error('Error:', error);
                    reject(error);
                }
        });
    }

}