export const EU_COUNTRIES = [
    { name: "Austria", code: "AT" },
    { name: "Belgium", code: "BE" },
    { name: "Bulgaria", code: "BG" },
    { name: "Croatia", code: "HR" },
    { name: "Cyprus", code: "CY" },
    { name: "Czech Republic", code: "CZ" },
    { name: "Denmark", code: "DK" },
    { name: "Estonia", code: "EE" },
    { name: "Finland", code: "FI" },
    { name: "France", code: "FR" },
    { name: "Germany", code: "DE" },
    { name: "Greece", code: "GR" },
    { name: "Hungary", code: "HU" },
    { name: "Ireland", code: "IE" },
    { name: "Italy", code: "IT" },
    { name: "Latvia", code: "LV" },
    { name: "Lithuania", code: "LT" },
    { name: "Luxembourg", code: "LU" },
    { name: "Malta", code: "MT" },
    { name: "Netherlands", code: "NL" },
    { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" },
    { name: "Romania", code: "RO" },
    { name: "Slovakia", code: "SK" },
    { name: "Slovenia", code: "SI" },
    { name: "Spain", code: "ES" },
    { name: "Sweden", code: "SE" }
];

const NEIGHBORS: Record<string, string[]> = {
    "AT": ["DE", "CZ", "SK", "HU", "SI", "IT"],
    "BE": ["NL", "DE", "LU", "FR"],
    "BG": ["RO", "GR"],
    "HR": ["SI", "HU"],
    "CY": [],
    "CZ": ["DE", "PL", "SK", "AT"],
    "DK": ["DE", "SE"],
    "EE": ["LV", "FI"],
    "FI": ["SE", "EE"],
    "FR": ["BE", "LU", "DE", "IT", "ES"],
    "DE": ["DK", "PL", "CZ", "AT", "FR", "LU", "BE", "NL"],
    "GR": ["BG"],
    "HU": ["AT", "SK", "RO", "HR", "SI"],
    "IE": [],
    "IT": ["FR", "AT", "SI"],
    "LV": ["EE", "LT"],
    "LT": ["LV", "PL"],
    "LU": ["BE", "DE", "FR"],
    "MT": [],
    "NL": ["BE", "DE"],
    "PL": ["DE", "CZ", "SK", "LT"],
    "PT": ["ES"],
    "RO": ["HU", "BG"],
    "SK": ["CZ", "PL", "HU", "AT"],
    "SI": ["IT", "AT", "HU", "HR"],
    "ES": ["PT", "FR"],
    "SE": ["DK", "FI"]
};

const REMOTE_COUNTRIES = ["CY", "MT", "GR", "IE", "PT", "FI", "SE", "BG", "RO", "EE", "LV", "LT"];

export function getProximityZone(vendorCountry: string, destinationCountry: string): number {
    if (vendorCountry === destinationCountry) return 1;
    const vendorNeighbors = NEIGHBORS[vendorCountry] || [];
    if (vendorNeighbors.includes(destinationCountry)) return 2;
    if (REMOTE_COUNTRIES.includes(destinationCountry)) return 4;
    return 3;
}
