const pick = <T extends Record<string, unknown>, k extends keyof T>(
  obj: T,
  keys: k[]
): Partial<T> => {
  const finalObj: Partial<T> = {};

  if (keys.length === 0 || !obj || typeof obj !== 'object') {
    return finalObj;
  } else {
    keys.forEach(key => {
      if (key in obj) {
        finalObj[key] = obj[key];
      }
    });
    return finalObj;
  }
};

export default pick;
