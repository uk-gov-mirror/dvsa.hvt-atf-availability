import { format } from 'date-fns';
import express, { Express } from 'express';
import { Environment } from 'nunjucks';
import { setUpNunjucks } from '../../src/utils/viewHelper.util';

type DateFunctionType = (date: string) => string;

const app: Express = express();
const nunjucks: Environment = setUpNunjucks(app);
const someDate = new Date().toISOString();

jest.mock('date-fns', () => ({
  format: jest.fn(),
}));

describe('Test viewHelper', () => {
  describe('formatDate filter function', () => {
    it('should call format() with proper params', () => {
      const formatDate: DateFunctionType = <DateFunctionType> nunjucks.getFilter('formatDate');

      formatDate(someDate);

      expect(format).toHaveBeenCalledWith(new Date(someDate), 'dd MMMM yyyy');
    });
  });

  describe('formatDateTime filter function', () => {
    it('should call format() with proper params', () => {
      const formatDateTime: DateFunctionType = <DateFunctionType> nunjucks.getFilter('formatDateTime');

      formatDateTime(someDate);

      expect(format).toHaveBeenCalledWith(new Date(someDate), 'EEEE dd MMMM yyyy \'at\' h:m aaaa');
    });
  });
});
