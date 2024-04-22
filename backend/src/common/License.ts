export interface License {
    id: number;
    name: string;
    company: string | null;
    manufacturer: string | null;
    product_key: string;
    order_number: string;
    purchase_order: string;
    purchase_date: {
        date: string;
        formatted: string;
    };
    termination_date: {
        date: string;
        formatted: string;
    };
    depreciation: number | null;
    purchase_cost: number | null;
    purchase_cost_numeric: number | null;
    notes: string;
    expiration_date: {
        date: string;
        formatted: string;
    };
    seats: number;
    free_seats_count: number;
    license_name: string;
    license_email: string;
    reassignable: boolean;
    maintained: boolean;
    supplier: string | null;
    category: {
        id: number;
        name: string;
    };
    created_at: {
        datetime: string;
        formatted: string;
    };
    updated_at: {
        datetime: string;
        formatted: string;
    };
    deleted_at: string | null;
    user_can_checkout: boolean;
    available_actions: {
        checkout: boolean;
        checkin: boolean;
        clone: boolean;
        update: boolean;
        delete: boolean;
    };
}

export interface LicenseResponse {
    total: number;
    rows: License[];
}
