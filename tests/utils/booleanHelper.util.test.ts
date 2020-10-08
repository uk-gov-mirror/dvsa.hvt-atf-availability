import { booleanHelper } from '../../src/utils/booleanHelper.util';

describe('Test booleanHelper', () => {
  describe('mapBooleanToYesNoString method', () => {
    it('should map true boolean to \'yes\' string', () => {
      expect(booleanHelper.mapBooleanToYesNoString(true)).toBe('yes');
    });

    it('should map false boolean to \'no\' string', () => {
      expect(booleanHelper.mapBooleanToYesNoString(false)).toBe('no');
    });
  });
});
