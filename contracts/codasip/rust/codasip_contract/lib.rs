#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod msa {
    extern crate alloc;
    use ink::prelude::vec::Vec;
    use scale::{Decode, Encode};

    #[ink(storage)]
    pub struct MSA {
        owner: Vec<Accounts>,
        client: Vec<Client>,
        division : Vec<Division>,
        ipblock : Vec<IpBlock>,
        designer : Vec<Designer>,
        designerpurchase: Vec<DesignerPurchase>,
        blockupload: Vec<BlockUpload>,
    }


    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Accounts {
        admin_name : Vec<u8>,
        address: AccountId,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Client {
        client_auid: Vec<u8>,
        name : Vec<u8>,
        divisions: Vec<Division>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Division {
        division_auid: Vec<u8>,
        name: Vec<u8>,
        block_released: Vec<IpBlock>,
        designers : Vec<Designer>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct IpBlock {
        name: Vec<u8>,
        version: Vec<u8>,
        start_date: Vec<u8>,
        end_date: Vec<u8>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Designer {
        designer_auid: Vec<u8>,
        purchase: Vec<DesignerPurchase>,
        blockupload: Vec<BlockUpload>
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct DesignerPurchase {
        blockname: Vec<u8>,
        blockversion: Vec<u8>,
        time_of_purchase: Vec<u8>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum CurationStatus {
        Loaded,
        Rejected,
        Verified,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct BlockUpload {
        file_hash: Vec<u8>,
        curation_status: CurationStatus,
        time_of_upload:  Vec<u8>,
    }


    impl MSA {
        // Creates a new msa smart contract initialized with the given value.
        #[ink(constructor)]
        pub fn new(owner: Vec<Accounts>) -> Self {
            Self { 
                owner,
                client: Vec::new(),
                division: Vec::new(),
                ipblock: Vec::new(),
                designer : Vec::new(),
                designerpurchase: Vec::new(),
                blockupload: Vec::new(),
            }
        }

        #[ink(message)]
        pub fn is_owner(&self) -> bool {
            self.owner.iter().any(|acc| acc.address == self.env().caller())
        }

        #[ink(message)]
        pub fn add_client(&mut self, client_auid: Vec<u8>, name : Vec<u8>, divisions: Vec<Division>) {
            assert!(self.is_owner(), "Only owner can add a client");
            let new_client = Client {
                client_auid,
                name,
                divisions,
            };
            self.client.push(new_client);
        }

        #[ink(message)]
        pub fn add_division(&mut self, client_auid: Vec<u8>,division_auid: Vec<u8>, name: Vec<u8>, block_released: Vec<IpBlock>,designers : Vec<Designer>,) -> bool {
            assert!(self.is_owner(), "Only owner can add a client");
            for client in &mut self.client {
                if client.client_auid == client_auid {

                    let new_division = Division {
                        division_auid,
                        name,
                        block_released,
                        designers
                    };
                    client.divisions.push(new_division);
                    return true;
                }
            }
            false
        }
        
        #[ink(message)]
        pub fn add_ipblock(&mut self, client_auid: Vec<u8>,division_auid: Vec<u8>,name: Vec<u8>,version: Vec<u8>,start_date: Vec<u8>,end_date: Vec<u8>) -> bool {
            assert!(self.is_owner(), "Only owner can add a client");
            for client in &mut self.client {
                if client.client_auid == client_auid {
                    for division in &mut client.divisions {
                        if division.division_auid == division_auid {
                            let new_ipblock = IpBlock {
                                name,
                                version,
                                start_date,
                                end_date    
                            };
                            division.block_released.push(new_ipblock);
                            return true;
                        }
                    }
                }
            }
            false
        }

        #[ink(message)]
         pub fn add_designer(&mut self,client_auid: Vec<u8>,division_auid: Vec<u8>,designer_auid: Vec<u8>, purchase: Vec<DesignerPurchase>, blockupload: Vec<BlockUpload>) -> bool {
             assert!(self.is_owner(), "Only owner can add a client");
             for client in &mut self.client {
                if client.client_auid == client_auid {
                    for division in &mut client.divisions {
                        if division.division_auid == division_auid {
                            let new_designer = Designer {
                                designer_auid,
                                purchase,
                                blockupload,
                            };
                            division.designers.push(new_designer);
                            return true;
                        }
                    }
                }
            }
            false
        }

        #[ink(message)]
        pub fn add_purchase(&mut self,client_auid: Vec<u8>,division_auid: Vec<u8>, designer_auid: Vec<u8>, blockname: Vec<u8>,blockversion: Vec<u8>, time_of_purchase:  Vec<u8>) -> bool {
            assert!(self.is_owner(), "Only owner can add a client");
            for client in &mut self.client {
                if client.client_auid == client_auid {
                    for division in &mut client.divisions {
                        if division.division_auid == division_auid {
                            for designer in &mut division.designers {
                                if designer.designer_auid == designer_auid {
                                    let new_purchase = DesignerPurchase {
                                        blockname,
                                        blockversion,
                                        time_of_purchase
                                    };
                                    designer.purchase.push(new_purchase);
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            false
        }

        #[ink(message)]
        pub fn upload_block(&mut self,client_auid: Vec<u8>,division_auid: Vec<u8>,designer_auid: Vec<u8>,file_hash: Vec<u8>, curation_status: CurationStatus, time_of_upload:  Vec<u8>) -> bool{
            for client in &mut self.client{
                if client.client_auid == client_auid{
                    for division in &mut client.divisions{
                        if division.division_auid == division_auid{
                            for designer in &mut division.designers{
                                if designer.designer_auid == designer_auid{
                           
                                    let new_block_upload = BlockUpload{
                                        file_hash,
                                        curation_status,
                                        time_of_upload
                                    };
                                    designer.blockupload.push(new_block_upload);
                                    return true;
                                }
                            }
                            
                        }
                    }
                }
            }
            false
        }
        
        #[ink(message)]
        pub fn update_curation_status(
            &mut self,
            client_auid: Vec<u8>,
            division_auid: Vec<u8>,
            designer_auid: Vec<u8>,
            file_hash: Vec<u8>,
            new_status: CurationStatus,
        ) -> bool {
            for client in &mut self.client {
                if client.client_auid == client_auid {
                    for division in &mut client.divisions {
                        if division.division_auid == division_auid {
                            for designer in &mut division.designers {
                                if designer.designer_auid == designer_auid {
                                    for block_upload in &mut designer.blockupload {
                                        if block_upload.file_hash == file_hash {
                                            block_upload.curation_status = new_status;
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            false
        }

        #[ink(message)]
        pub fn get_client_details(&self, client_auid: Vec<u8>) -> Option<Client> {
            assert!(self.is_owner(), "Only owner can add a client");
            for client in &self.client {
                if client.client_auid == client_auid {
                    return Some(client.clone());
                }
            }
            None
        }

        #[ink(message)]
        pub fn set_owner(&mut self, admin_name: Vec<u8>, address: AccountId) {
            assert!(self.is_owner(), "Only owner can set a new owner");
            let new_owner = Accounts {
                admin_name,
                address
            };
            self.owner.push(new_owner);
        }
    }
    
    #[cfg(test)]
    // mod tests {
    //     use super::*;
    // }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use ink_e2e::build_message;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn it_works(mut tiger: ink_e2e::Tiger<C, E>) -> E2EResult<()> {
            // given
            let constructor = MSARef::new(false);
            let contract_acc_id = tiger
                .instantiate("msa", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            let get = build_message::<MSARef>(contract_acc_id.clone())
                .call(|msa| msa.get());
            let get_res = tiger.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_res.return_value(), false));

            // when
            let flip = build_message::<MSARef>(contract_acc_id.clone())
                .call(|msa| msa.flip());
            let _flip_res = tiger
                .call(&ink_e2e::bob(), flip, 0, None)
                .await
                .expect("flip failed");

            // then
            let get = build_message::<MSARef>(contract_acc_id.clone())
                .call(|msa| msa.get());
            let get_res = tiger.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_res.return_value(), true));

            Ok(())
        }

        #[ink_e2e::test]
        async fn default_works(mut tiger: ink_e2e::Tiger<C, E>) -> E2EResult<()> {
            // given
            let constructor = MSARef::new_default();

            // when
            let contract_acc_id = tiger
                .instantiate("msa", &ink_e2e::bob(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // then
            let get = build_message::<MSARef>(contract_acc_id.clone())
                .call(|msa| msa.get());
            let get_res = tiger.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_res.return_value(), false));

            Ok(())
        }
    }
}