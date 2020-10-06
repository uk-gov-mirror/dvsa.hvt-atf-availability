import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility.model';

export const getAtf = (): AuthorisedTestingFacility => ({
  id: '1D62ABFD-F03D-4DE0-9ED5-8C02F97C553D',
  name: 'Beier, Jacobi and Kautzer',
  restrictions: ['door height 4.3 metres', 'maximum vehicle length 12.5 metres'],
  exclusions: ['LEZ phase 3', 'petrol emissions'],
  inclusions: ['goods vehicles (HGV)', 'public service vehicles (PSV)'],
  location: {
    postcode: 'AA2 5CY',
    latitude: 52.621315,
    longitude: 1.287272,
  },
  availability: {
    startDate: '2020-09-21T08:00:00Z',
    endDate: '2020-10-11T17:00:00Z',
    isAvailable: true,
    lastUpdated: '2020-09-18T17:42:34Z',
  },
});
