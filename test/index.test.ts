import { TestCases, TestMetaData, TestExpectation } from 'jest-simple-template';
import mocks from './mocks';
import { ApiValidator } from '../src/index';

const inputPath = {
  p_number: 1,
  p_string: 'test',
  p_boolean: true,
};
const inputPath1 = {
  p_number: 1,
  p_string: 'test'
};

const inputQuery = {
  q_number: 1,
  q_string: 'test',
  q_boolean: true,
};

const inputBody = {
  b_number: 1,
  b_string: 'test',
  b_boolean: true,
  b_object: {
    test: 'test',
  },
  b_array: [1, 2, 3],
};

const event1 = {
  requestContext: {
    authorizer: {
      principalId: 'tesuuser',
    },
  },
  pathParameters: inputPath,
  queryStringParameters: inputQuery,
  body: JSON.stringify(inputBody),
};

const event2 = {
  requestContext: {
    authorizer: {} 
  },
  pathParameters: inputPath,
  queryStringParameters: inputQuery,
  body: JSON.stringify(inputBody),
};

const event3 = {
  requestContext: {
    authorizer: {
      principalId: 'tesuuser',
    },
  },
  pathParameters: inputPath1,
  queryStringParameters: inputQuery,
  body: JSON.stringify(inputBody),
};

/**
 * Test Case Definition
 *
 * [0]: test description
 * [1]: request(input)
 * [2]: expect(output)
 */
const testCase: TestCases = [
  [
    {
      name: 'SucceededAllParameters',
      description: 'Specify all kind of parameters',
    },
    () => {
      return {
        event: event1,
        spec: {
          principalId: 'requestContext:string:true',
          p_number: 'path:number',
          p_string: 'path:string',
          p_boolean: 'path:boolean',
          q_number: 'query:number',
          q_string: 'query:string',
          q_boolean: 'query:boolean',
          b_number: 'body:number',
          b_string: 'body:string',
          b_boolean: 'body:boolean',
          b_object: 'body:object',
          b_array: 'body:object',
        } 
      }
    },
    (result, spies) => {
      expect(result.getIsValid()).toBeTruthy();
      expect(result.getValues()).toEqual({
        principalId: 'tesuuser',
        p_number: 1,
        p_string: 'test',
        p_boolean: true,
        q_number: 1,
        q_string: 'test',
        q_boolean: true,
        b_number: 1,
        b_string: 'test',
        b_boolean: true,
        b_object: { test: 'test' },
        b_array: [1, 2, 3],
      });
      expect(result.getErrors()).toEqual({});
      if (spies) {
        console.log(spies);
      }
    },
  ],
  [
    {
      name: 'FailureMissingRequired',
      description: 'Missing Required parameter',
    },
    () => {
      return {
        event: event2,
        spec: {
          principalId: 'requestContext:string:true',
          p_number: 'path:number',
          p_string: 'path:string',
          p_boolean: 'path:boolean',
          q_number: 'query:number',
          q_string: 'query:string',
          q_boolean: 'query:boolean',
          b_number: 'body:number',
          b_string: 'body:string',
          b_boolean: 'body:boolean',
          b_object: 'body:object',
          b_array: 'body:object',
        } 
      }
    },
    (result, spies) => {
      console.log(result);
      expect(result.getIsValid()).toBeFalsy();
      expect(result.getErrors()).toEqual({
        principalId: 'missing_required',
      });
      if (spies) {
        console.log(spies);
      }
    },
  ],
  [
    {
      name: 'SucceededMissingNotRequired',
      description: 'Missing Non Required parameter',
    },
    () => {
      return {
        event: event3,
        spec: {
          principalId: 'requestContext:string:required',
          p_number: 'path:number',
          p_string: 'path:string',
          p_boolean: 'path:boolean',
          q_number: 'query:number',
          q_string: 'query:string',
          q_boolean: 'query:boolean',
          b_number: 'body:number',
          b_string: 'body:string',
          b_boolean: 'body:boolean',
          b_object: 'body:object',
          b_array: 'body:object',
        } 
      }
    },
    (result, spies) => {
      console.log(result);
      expect(result.getIsValid()).toBeTruthy();
      expect(result.getErrors()).toEqual({});
      if (spies) {
        console.log(spies);
      }
    },
  ],
];

describe.each(testCase)('Validation', (d, r, e) => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  const testMeta = d as TestMetaData;
  it(`${testMeta.name}:${testMeta.description}`, async () => {
    const spies =
      mocks && mocks[testMeta.name] ? mocks[testMeta.name]() : undefined;

    const request = typeof r === 'function' ? r() : r;
    const validator = new ApiValidator(request.spec);
    // @ts-ignore
    validator.validate(request.event);
    const expected = e as TestExpectation;
    // @ts-ignore
    expected(validator, spies);
  });
});
