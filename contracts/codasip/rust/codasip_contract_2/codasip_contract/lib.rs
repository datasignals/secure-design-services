#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod msa {
    extern crate alloc;
    use ink::prelude::format;
    use ink::prelude::vec::Vec;
    use ink::prelude::vec;
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    #[ink(storage)]
    pub struct MSA {
        client: Vec<Client>,
        division : Division,
        ipblock : IpBlock,
        designer : Designer,
        designerpurchase: DesignerPurchase,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Client {
        client_auid: Vec<u8>,
        name: Vec<u8>,
        email: Vec<u8>,
        divisions: Vec<Division>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Division {
        name: Vec<u8>,
        available: Vec<IpBlock>,
        designers: Vec<Designer>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct IpBlock {
        name: Vec<u8>,
        version: Vec<u8>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Designer {
        name: Vec<u8>,
        purchases: Vec<DesignerPurchase>,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct DesignerPurchase {
        tiger: Vec<u8>,
        division: Vec<u8>,
        designername: Vec<u8>,
        blockname: Vec<u8>,
        blockversion: Vec<u8>,
    }


    impl MSA {
        /// Creates a new msa smart contract initialized with the given value.
        #[ink(constructor)]
        pub fn template() -> Self {
            Self { client: Vec::new(),
                division: Division::default(),
                ipblock: IpBlock::default(),
                designer : Designer::default(),
                designerpurchase: DesignerPurchase::default(),
            }
        }

        #[ink(message)]
        pub fn add_client(
            &mut self,
            client_auid: Vec<u8>,
            name: Vec<u8>,
            email: Vec<u8>,
            divisions: Vec<Division>,
        ) {
            let new_client = Client {
                client_auid,
                name,
                email,
                divisions,
            };
            self.client.push(new_client);
        }

        #[ink(message)]
        pub fn add_division(
            &mut self,
            name: Vec<u8>,
            available: Vec<IpBlock>,
            designers: Vec<Designer>,
        ) {
            self.division = Division {
                name,
                available,
                designers,
            };
        }

        #[ink(message)]
        pub fn add_ipblock(
            &mut self,
            name: Vec<u8>,
            version: Vec<u8>,
        ) {
            self.ipblock = IpBlock {
                name,
                version,
            };
        }


        #[ink(message)]
        pub fn add_designer(
            &mut self,
            name: Vec<u8>,
            purchases: Vec<DesignerPurchase>,
        ) {
            self.designer = Designer {
                name,
                purchases,
            };
        }


        #[ink(message)]
        pub fn add_purchase(
            &mut self,
            tiger: Vec<u8>,
            division: Vec<u8>,
            designername: Vec<u8>,
            blockname: Vec<u8>,
            blockversion: Vec<u8>,
        ) {
            self.designerpurchase = DesignerPurchase {
                tiger,
                division,
                designername,
                blockname,
                blockversion ,
            };
        }


        #[ink(message)]
        pub fn get_clients(&self) -> Vec<Client> {
            self.client.clone()
        }

        #[ink(message)]
        pub fn get_client_details(&self, client_auid: Vec<u8>) -> Option<Client> {
            for client in &self.client {
                if client.client_auid == client_auid {
                    return Some(client.clone());
                }
            }
            None
        }
        //use ink::vec; 
        #[ink(message)]
        pub fn update_client_division(&mut self, client_auid: Vec<u8>, new_division: Division) -> bool {
            for client in &mut self.client {
                if client.client_auid == client_auid {
                    client.divisions = vec![new_division.clone()];
                    return true;
                }
            }           
            false
        }
    }

    impl Default for Client {
        fn default() -> Self {
            Self {
                client_auid: Vec::new(),
                name: Vec::new(),
                email: Vec::new(),
                divisions: Vec::new(),
            }
        }
    }

    impl Default for Division {
        fn default() -> Self {
            Self {
                name: Vec::new(),
                available: Vec::new(),
                designers: Vec::new(),
            }
        }
    }

    impl Default for IpBlock {
        fn default() -> Self {
            Self {
                name: Vec::new(),
                version: Vec::new(),
            }
        }
    }

    impl Default for Designer {
        fn default() -> Self {
            Self {
                name: Vec::new(),
                purchases: Vec::new(),
            }
        }
    }

    impl Default for DesignerPurchase {
        fn default() -> Self {
            Self {
                tiger: Vec::new(),
                division: Vec::new(),
                designername: Vec::new(),
                blockname: Vec::new(),
                blockversion : Vec::new()
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
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