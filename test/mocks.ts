import { Mocks } from 'jest-simple-template';

const mocks: Mocks = {
  SucceededAllParameters: () => {
    let spy: jest.SpyInstance;
    return {
      // @ts-ignore
      spy,
    };
  },
};

export default mocks;
