interface Location {
  postcode: string;
  latitude: number;
  longitude: number;
}

export interface Availability {
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  lastUpdated: string;
}

export interface AuthorisedTestingFacility {
  id: string;
  name: string;
  location: Location;
  availability: Availability;
  inclusions: string[];
  exclusions: string[];
  restrictions: string[];
}
