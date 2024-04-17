  import { CountryInfo } from "./types";
  // Updated interface for TelephoneInputSettings to accept CountryInfo[]
  export interface TelephoneInputSettings {
    countries?: CountryInfo[] | string[];
    showFlag?:boolean;
  }