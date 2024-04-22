export default interface ConsentBatch {
    company: string,
    id: string,
    users: {
        name: string,
        sent: boolean,
        signed: boolean
    }[]
}
