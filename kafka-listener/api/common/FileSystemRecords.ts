export interface Filerecords{
        timestamp: { type: Number, required: true },
        eventType: { type: String, required: true },
        fileName: { type: String, required: true },
        designerName: {type: String, required: true},   
}
export interface FileSystemRecords{
    checksum: { type: String, required: true },
    key: { type: String, required: true },
    value: Filerecords[]
    blockchainhash: { type: String, required: true },
}