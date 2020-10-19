import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility.model';

export const getAtf = (): AuthorisedTestingFacility => (<AuthorisedTestingFacility> {
  id: '1D62ABFD-F03D-4DE0-9ED5-8C02F97C553D',
  name: 'Beier, Jacobi and Kautzer',
  phone: '123 446 46334',
  email: 'email@email.com',
  address: {
    line1: 'Flat 12',
    line2: 'Somewhere Street',
    town: 'Somewhere Town',
    postcode: 'AB12 3CD',
  },
  geoLocation: { lat: 1, long: 2 },
  restrictions: ['door height 4.3 metres', 'maximum vehicle length 12.5 metres'],
  exclusions: ['LEZ phase 3', 'petrol emissions'],
  inclusions: ['goods vehicles (HGV)', 'public service vehicles (PSV)'],
  availability: {
    startDate: '2020-09-21T08:00:00Z',
    endDate: '2020-10-11T17:00:00Z',
    isAvailable: true,
    lastUpdated: '2020-09-18T17:42:34Z',
  },
});
