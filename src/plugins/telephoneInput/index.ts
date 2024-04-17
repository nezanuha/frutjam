import allCountries from "./data";
import { CountryInfo } from "./types";
import { TelephoneInputSettings } from "./interfaces";

function countryCodeToEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default class TelephoneInput {
  private inputElement: HTMLInputElement | null = null;
  private selectElement: HTMLSelectElement;
  private countries: Record<string, CountryInfo> = {};
  private showFlag: boolean;

  constructor(elementId: string, settings: TelephoneInputSettings) {
    this.inputElement = document.getElementById(elementId) as HTMLInputElement | null;
    this.selectElement = document.createElement('select');
    this.showFlag = settings.showFlag ?? false; // Default to false if not provided
    this.init();

    if (this.inputElement) {
      const countryCodes = Array.isArray(settings.countries)
        ? settings.countries.map((country) => (typeof country === 'string' ? country : country.code))
        : Object.keys(allCountries);

      this.convertCountries(countryCodes).then((convertedCountries) => {
        this.countries = convertedCountries;
        this.createCountryDropdown(); // Call createCountryDropdown after countries are loaded
      });
    } else {
      console.error(`Element with ID '${elementId}' not found.`);
    }
  }

  // Other methods remain unchanged

  private async convertCountries(countries: string[]): Promise<Record<string, CountryInfo>> {
    const countryObjects = await Promise.all(
      countries.map(async (code) => {
        return allCountries[code] ? {
          code,
          name: allCountries[code].name,
          flag: this.showFlag ? countryCodeToEmoji(allCountries[code].code) : '', // Conditionally include emoji flag
          exampleNumber: allCountries[code].exampleNumber
        } : null;
      })
    );
    return countryObjects.filter((country) => country !== null).reduce((acc, country) => {
      if (country) acc[country.code] = country;
      return acc;
    }, {} as Record<string, CountryInfo>);
  }
  // Other methods like init, createCountryDropdown, updatePlaceholder remain unchanged

  private init() {
    if (this.inputElement) {
      // Check if the input element is already inside a div with data-fj="telephoneInput"
      if (!this.inputElement.closest('[data-fj="telephoneInput"]')) {
        // Create a div with data-fj="telephoneInput" attribute
        const telephoneInputDiv = document.createElement('div');
        telephoneInputDiv.setAttribute('data-fj', 'telephoneInput');
  
        // Append the input element to the div
        const parent = this.inputElement.parentNode;
        if (parent) {
          parent.insertBefore(telephoneInputDiv, this.inputElement);
          telephoneInputDiv.appendChild(this.inputElement);
        } else {
          console.error('Input element has no parent node.');
        }
      } else {
        console.error('Input element is already inside a div with data-fj="telephoneInput".');
      }
    } else {
      console.error('Input element is not initialized.');
    }
  }
  

  private createCountryDropdown() {
    // Clear the existing content of selectElement
    this.selectElement.innerHTML = '';
  
    // Populate selectElement with options
    Object.values(this.countries).forEach((country) => {
      const option = document.createElement('option');
      option.value = country.code;
      const emojiFlag = countryCodeToEmoji(country.code);
      option.text = this.showFlag ? `${emojiFlag} ${country.name} (${country.code})` : `${country.name} (${country.code})`;
      
      // Append the option to the selectElement
      this.selectElement.appendChild(option);
    });
  
    // Check if selectElement is not already part of the DOM
    if (!this.selectElement.parentNode && this.inputElement && this.inputElement.parentNode) {
      // Prepend selectElement before the input element
      this.inputElement.parentNode.insertBefore(this.selectElement, this.inputElement);
    }
  }
  
  

  private updatePlaceholder() {
    const selectedCountryCode = this.selectElement.value;
    const selectedCountry = this.countries[selectedCountryCode];
    if (selectedCountry) {
      this.inputElement?.setAttribute('placeholder', `E.g., ${selectedCountry.exampleNumber}`);
    } else {
      this.inputElement?.removeAttribute('placeholder');
    }
  }
}
