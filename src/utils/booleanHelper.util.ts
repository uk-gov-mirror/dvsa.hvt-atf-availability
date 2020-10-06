export const mapYesNoStringToBoolean = (yesOrNo: string): boolean => {
  switch (yesOrNo) {
    case 'yes':
      return true;
    case 'no':
      return false;
    default:
      throw new Error(`Given string (${yesOrNo}) cannot be parsed to boolean`);
  }
};

export const mapBooleanToYesNoString = (isTrue: boolean): string => (isTrue ? 'yes' : 'no');

export const booleanHelper = {
  mapYesNoStringToBoolean,
  mapBooleanToYesNoString,
};
