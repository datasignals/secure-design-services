#![cfg_attr(not(feature = "std"), no_std, no_main)]
#[ink::contract]
pub mod hash_storage_contract {
    extern crate alloc;
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;
    
    #[ink(storage)]
    pub struct FileSystemContract {
        // Declare a vector to store checksum
        checksum: Vec<String>,
    }

    // Declare the implementation block for the smart contract
    impl FileSystemContract {
        // Constructor to initialize the smart contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { checksum: Vec::new() }
        }

        // // Public function to push a hash into the array
        // #[ink(message)]
        // pub fn push_hash(&mut self, hash: Vec<u8>) {
        //     // Push the provided hash into the vector
        //         self.checksum.push(hash);
        // }

         // Public function to push a hash into the array
        #[ink(message)]
        pub fn push_hash(&mut self, hash: String) -> bool {
                if !self.checksum.contains(&hash){
                        self.checksum.push(hash);
                        return true
                }
                else{
                    return false
                }
        }

        // Public function to retrieve all checksum
        #[ink(message)]
        pub fn get_hashes(&self) -> Vec<String> {
            // Return a cloned vector of all stored checksum
            self.checksum.clone()
        }
    }    
}

