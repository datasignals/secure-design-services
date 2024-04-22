import fs from "fs";
import SignatureBox from "./common/SignatureBox";

export default class DocumentStorage {

    private readonly company: string;
    private readonly storage: string;

    private storageExists(): boolean {
        return fs.existsSync(this.storage);
    }

    private createStorage(): boolean {
        try {
            fs.mkdirSync(this.storage, {recursive: true})
        } catch (e) {
            console.error(e);
            return false;
        }
        return true;
    }

    constructor(company: string) {
        this.company = company
        this.storage = `uploads/documents/${this.company}`;
        if (!this.storageExists()) {
            const result = this.createStorage();
            if (!result) {
                throw new Error("Failed to create Storage!");
            }
        }
    }


    public listDocuments(): string[] {
        try{
            const docs = fs.readdirSync(this.storage);
            return docs.filter(e => /\.pdf$/i.test(e));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    public putDocument(sourceLocation: string, docName: string): boolean {
        try {
            //TODO i should not force pdf like that
            fs.copyFileSync(sourceLocation, `${this.storage}/${docName}.pdf`);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public putSignature(signature: SignatureBox[], company: string, docName: string): boolean {
        const endsWithPDF = docName.toLowerCase().endsWith(".pdf");
        const signatureName = endsWithPDF ? docName.replace(/\.pdf$/, ".json") : `${docName}.json`

        //TODO this is a band-aid solution for duplicating boxes
        // this needs solving on the PDF reader screen
        const filteredSignatures = signature.filter((s, index, array) =>
                index === array.findIndex(a =>
                    a.x === s.x &&
                    a.y === s.y
                )
        );

        try {
            fs.writeFileSync(`${this.storage}/${signatureName}`, JSON.stringify(filteredSignatures, null, 2));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public getSignatures(docName: string): SignatureBox[] {
        try {
            const signatureBuffer: Buffer = fs.readFileSync(this.storage + `/${docName}.json`);
            const signature: SignatureBox[] = JSON.parse(signatureBuffer.toString());
            return signature;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    public getDocumentPath(docName: string): string {
        return this.storage + `/${docName}`;
    }

}
