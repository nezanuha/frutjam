type CountryInfo = {
    code: string;
    name: string;
    exampleNumber: string;
};

interface TelephoneInputSettings {
    countries?: CountryInfo[] | string[];
    showFlag?: boolean;
}

declare class TelephoneInput {
    private inputElement;
    private selectElement;
    private countries;
    private showFlag;
    constructor(elementId: string, settings: TelephoneInputSettings);
    private convertCountries;
    private init;
    private createCountryDropdown;
    private updatePlaceholder;
}

export { TelephoneInput as default };
