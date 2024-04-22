import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Keyring } from "@polkadot/keyring";
import type { WeightV2 } from '@polkadot/types/interfaces';
import { BN, BN_ONE } from '@polkadot/util';
import { blockchainConfig } from './index';
import metadata from "../blockchain/metadata.json"

export default class GetChecksum{
    async getChecksum() {
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
        } else {
            console.error('maxBlock or refTime property does not exist');
        }

        const { gasRequired} = await contract.query.getHashes(
            alice.address,
            {
                gasLimit: api.registry.createType('WeightV2', {
                    refTime: maxBlockRefTime,
                    // proofSize : maxBlockproofSize,
                    proofSize: MAX_CALL_WEIGHT
                }) as WeightV2,
            });
                
        
        try {
            const checkStatus = async () => {            
            const { output } = await contract.query.getHashes(
                alice.address,
                {
                    gasLimit:gasRequired,
                }
            );
            return output?.toHuman()
            } 
            const checksum = await checkStatus () 
            return checksum;
            } catch (error) {
                console.error('Error:', error);
                return error;        
            }
        
        
    }
}