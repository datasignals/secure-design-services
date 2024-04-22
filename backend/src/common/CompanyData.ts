import { Binary } from "mongodb";

export default interface CompanyData {
    companyName: string;
    companyManager: string;
    group: string,
    graphics: Binary
}
