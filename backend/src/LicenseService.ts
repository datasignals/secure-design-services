import axios, {AxiosResponse} from "axios";
import {License, LicenseResponse} from "./common/License";


export default class LicenseService {

    constructor(private readonly config: { address: string, apiToken: string }) {
        this.config = config;
    }

    async getLicense(licenseKey: string): Promise<LicenseResponse | undefined> {
        try {

            const res: AxiosResponse<LicenseResponse> = await axios.get(this.config.address + `?search=${licenseKey}`, {
                headers: {
                    Authorization: `Bearer ${this.config.apiToken}`,
                },
            });

            if (res.status === 200) {
                return res.data;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("Failed to get a license from the server, reason: " + e.toString());
            return undefined;
        }
    }

    async isLicenseValid(license: License): Promise<boolean> {
        const currentDate = Date.now();
        const purchaseDate = Date.parse(license.purchase_date.date)
        const expirationDate = Date.parse(license.expiration_date.date);

        if (purchaseDate >= expirationDate) {
            return false;
        }

        // Check if current date is between purchase date and expiry date
        return currentDate >= purchaseDate && currentDate <= expirationDate;
    }

}
