import { Request } from 'express';
import { request } from '../../src/utils/request.util';
import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility.model';
import { availabilityService } from '../../src/services/availability.service';
import { getAtf } from '../data-providers/atf.dataProvider';
import { TokenPayload } from '../../src/models/token.model';
import { logger } from '../../src/utils/logger.util';
import { Availability } from '../../src/models/availability.model';
import { ATFOperationException } from '../../src/exceptions/atfOperation.exception';

request.get = jest.fn();
request.put = jest.fn();
logger.info = jest.fn();
logger.warn = jest.fn();
logger.error = jest.fn();

process.env = {
  API_BASE_URL_READ: 'api-base-uri-read',
  API_BASE_URL_WRITE: 'api-base-uri-write',
  DYNAMODB_ATF_TABLE_NAME: 'dynamodb-atf-table-name',
};

describe('Test availability.service', () => {
  let atf: AuthorisedTestingFacility;

  beforeEach(() => {
    atf = getAtf();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAtf method', () => {
    it('should call request.get() with proper params and return atf when found', async () => {
      (request.get as jest.Mock).mockReturnValue(Promise.resolve({ data: atf }));

      const result: AuthorisedTestingFacility = await availabilityService.getAtf({} as Request, atf.id);

      expect(result).toStrictEqual(atf);
      expect(request.get).toHaveBeenCalledWith(
        {},
        `${process.env.API_BASE_URL_READ}/${process.env.DYNAMODB_ATF_TABLE_NAME}/${atf.id}?keyName=id`,
      );
    });

    it('should log and throw an ATFOperationException error when something went wrong', async () => {
      const initialError: Error = new Error('Oops!');
      const expectedError: ATFOperationException = new ATFOperationException();
      (request.get as jest.Mock).mockReturnValue(Promise.reject(initialError));

      await expect(() => availabilityService.getAtf(
        {} as Request,
        atf.id,
      )).rejects.toThrow(expectedError);

      const initialErrorString: string = JSON.stringify(initialError, Object.getOwnPropertyNames(initialError));
      expect(logger.warn).toHaveBeenCalledWith(
        {} as Request,
        `Failed to retrieve ATF [${atf.id}] details, error: ${initialErrorString}`,
      );
    });
  });

  describe('updateAtfAvailability method', () => {
    let dateSpy: jest.SpyInstance;
    let tokenPayload: TokenPayload;

    beforeEach(() => {
      tokenPayload = {
        atfId: atf.id,
        isAvailable: false,
        startDate: '2020-09-21T08:00:00Z',
        endDate: '2020-10-11T17:00:00Z',
      };
      const mockDate: Date = new Date(1466424490000);
      dateSpy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate as unknown as string);
    });

    it('should call request.put() with proper params and return updated atf', async () => {
      const updatedAvailability: Availability = {
        isAvailable: true,
        startDate: tokenPayload.startDate,
        endDate: tokenPayload.endDate,
        lastUpdated: new Date().toISOString(),
      };
      const updatedAtf: AuthorisedTestingFacility = atf;
      updatedAtf.availability = updatedAvailability;
      (request.put as jest.Mock).mockReturnValue(Promise.resolve({ data: updatedAtf }));

      const result: AuthorisedTestingFacility = await availabilityService.updateAtfAvailability(
        {} as Request,
        tokenPayload,
        true,
      );

      expect(result).toStrictEqual(updatedAtf);
      expect(request.put).toHaveBeenCalledWith(
        {},
        `${process.env.API_BASE_URL_WRITE}/${process.env.DYNAMODB_ATF_TABLE_NAME}/${atf.id}?keyName=id`,
        { availability: updatedAvailability },
      );
    });

    it('should log and throw an ATFOperationException error when something went wrong', async () => {
      const initialError: Error = new Error('Oops!');
      const expectedError: ATFOperationException = new ATFOperationException();
      (request.put as jest.Mock).mockReturnValue(Promise.reject(initialError));

      await expect(() => availabilityService.updateAtfAvailability(
        {} as Request,
        tokenPayload,
        false,
      )).rejects.toThrow(expectedError);

      const initialErrorString: string = JSON.stringify(initialError, Object.getOwnPropertyNames(initialError));
      expect(logger.warn).toHaveBeenCalledWith(
        {} as Request,
        `Failed to update ATF [${tokenPayload.atfId}] availability, error: ${initialErrorString}`,
      );
    });
  });
});
