export default interface ConsentBatch {
    company: string,
    id: string,
    docName: string,
    users: {
        name: string,
        sent: boolean,
        signed: boolean
    }[]
}
