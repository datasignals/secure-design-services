import * as fs from "fs";
import * as Path from "path";

interface CompanyData {
    companyName: string,
    companyManager: string,
    group: string,
    graphics: string
}

export default class CompanyStorage {

    protected readonly configLocation: string = Path.join(__dirname, "companies");
    protected readonly configName: string = "companies.json";
    protected readonly configFullPath: string = Path.resolve(this.configLocation, this.configName);

    configExists(): boolean {
        return fs.existsSync(this.configFullPath);
    }

    getCompanyData(): CompanyData[] | undefined {
        const buffer: Buffer = fs.readFileSync(this.configFullPath);
        if (buffer.toString().length <= 0) {
            return undefined;
        } else {
            return JSON.parse(buffer.toString());
        }
    }

    saveConfig(companyData: CompanyData[]) {
        try {
            fs.writeFileSync(this.configFullPath, JSON.stringify(companyData, null, 2));
        } catch (e) {
            console.error("Failed saving Company Data to a file, reason: " + e.toString());
        }
    }

}

