import { Address } from './address.model';
import { Availability } from './availability.model';
import { GeoLocation } from './geoLocation.model';

export interface AuthorisedTestingFacility {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: Address,
  geoLocation: GeoLocation
  availability: Availability;
  inclusions: string[];
  exclusions: string[];
  restrictions: string[];
}
