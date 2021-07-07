import { APIGatewayProxyEvent } from 'aws-lambda';

type Location = 'requestContext' | 'path' | 'query' | 'body';
type Type = 'string' | 'boolean' | 'number' | 'object';

/**
 * Validation Spec Object
 */
interface SpecObject {
  /**
   * Where the parameter located
   * @type {Location}
   */
  location: Location;

  /**
   * What a type of the parameter
   * @type {Type}
   */
  type: Type;

  /**
   * true: parameter is required, otherwise false
   */
  required: boolean;
}

/**
 * <location>:<data_type>:<required>
 */
type SpecShorthand = string;
type Spec = SpecObject | SpecShorthand;

/**
 * List of Validations
 */
interface SpecList {
  [parameter_name: string]: Spec;
}

/**
 * Types of Value of Validation Result
 */
type ResultType = string | number | boolean | object | undefined;

/**
 * Error types
 * missing_required: required parameter was not specified
 * type_error: parameter mismatched in the spec
 */
type ErrorType = 'missing_required' | 'type_error';

/**
 * Type predicate of ErrorType
 * @param val {any}
 * @returns
 */
function isErrorType(val: any): val is ErrorType {
  const tmp = val as ErrorType;
  return tmp === 'missing_required' || tmp === 'type_error';
}
interface Error {
  [parameter_name: string]: ErrorType;
}

/**
 * Validation Result Object
 */
interface Result {
  [name: string]: ResultType;
}

/**
 * ApiRequestValidator
 */
export class ApiValidator {
  specs: SpecList;
  errors: Error;
  values: Result;
  isValid: boolean = false;

  constructor(s: SpecList) {
    this.specs = s;
    this.values = {};
    this.errors = {};
  }

  getIsValid() {
    return this.isValid;
  }
  getValues() {
    return this.values;
  }
  getErrors() {
    return this.errors;
  }

  /**
   *
   * @param event {APIGatewayProxyEvent}
   */
  public validate(event: APIGatewayProxyEvent): Result {
    const ret: Result = {};

    Object.keys(this.specs).forEach((prop): void => {
      let s = this.extractShorthand(this.specs[prop]);

      let src;
      switch (s.location) {
        case 'requestContext':
          src = event.requestContext.authorizer;
          break;
        case 'path':
          src = event.pathParameters;
          break;
        case 'query':
          src = event.queryStringParameters;
          break;
        case 'body':
          src = JSON.parse(event.body || '');
          break;
        default:
          throw Error('Invalid location');
      }

      if (!src && s.required) {
        this.errors[prop] = 'missing_required';
        return;
      }

      const val = src[prop];
      const converted = this.convertProp(val, s);
      if (isErrorType(converted)) {
        this.errors[prop] = converted;
        return;
      }
      ret[prop] = converted;
    });

    this.isValid = Object.keys(this.errors).length <= 0;
    this.values = ret;
    return ret;
  }

  /**
   *
   * @param prop {string}
   * @returns {ValidationPropertyObject}
   */
  private extractShorthand(spec: Spec): SpecObject {
    let validationSpec: SpecObject;
    if (typeof spec === 'string') {
      const shorthand = spec as SpecShorthand;
      const properties = shorthand.split(':');
      validationSpec = {
        location: properties[0] as Location,
        type: properties[1] as Type,
        required: properties.length >= 3 ? properties[2] === 'true' : false,
      };
    } else {
      validationSpec = spec as SpecObject;
    }
    return validationSpec;
  }

  private convertProp(val: any, s: SpecObject): ResultType | ErrorType {
    if (!val && s.required) return 'missing_required';

    if (typeof val === s.type) {
      return this.convert(val, s.type);
    }
    return (s.required) ? 'type_error' : undefined
  }

  /**
   * Convert any value to specific type
   * @param val {any}
   * @param type {PropertyType}
   * @returns {ValidationResultValue}
   */
  private convert(val: any, type: Type): ResultType {
    switch (type) {
      case 'number':
        return val as number;
      case 'string':
        return val as string;
      case 'boolean':
        return val as boolean;
      default:
        return val;
    }
  }
}

export default ApiValidator
