export default interface User {
    username: string,
   // company: string,
    role: string,
    region: string,
    email: string,
    uniqueIdentifier?: string
    toDelete?: boolean
    sent?: boolean,
    signed?: boolean,
    selected?: boolean
}



// export default interface User1 {
//     username: string,
//     role: string,
//     region: string,
//     email: string,
// }