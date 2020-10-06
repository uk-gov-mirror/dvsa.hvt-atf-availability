import { booleanHelper } from '../../src/utils/booleanHelper.util';

describe('Test booleanHelper', () => {
  describe('mapYesNoStringToBoolean method', () => {
    it('should map \'yes\' string to true', () => {
      expect(booleanHelper.mapYesNoStringToBoolean('yes')).toBe(true);
    });

    it('should map \'no\' string to false', () => {
      expect(booleanHelper.mapYesNoStringToBoolean('no')).toBe(false);
    });

    it('should throw an erro when string other than (\'yes\', \'no\') provided', () => {
      expect(() => booleanHelper.mapYesNoStringToBoolean('foo'))
        .toThrowError('Given string (foo) cannot be parsed to boolean');
    });
  });

  describe('mapBooleanToYesNoString method', () => {
    it('should map true boolean to \'yes\' string', () => {
      expect(booleanHelper.mapBooleanToYesNoString(true)).toBe('yes');
    });

    it('should map false boolean to \'no\' string', () => {
      expect(booleanHelper.mapBooleanToYesNoString(false)).toBe('no');
    });
  });
});
