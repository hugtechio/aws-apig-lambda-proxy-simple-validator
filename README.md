# aws-apig-lambda-proxy-simple-validator

This is the simple validator for AWS APIGateway LambdaProxy.

# concept
- convention based
- similar to configuration (not decorative)
- readable
- understandable validation specification

# usage
```typescript

import ApiValidator from 'aws-apig-lambda-proxy-simple-validator'

handler(event, context) {
  const validator = new ApiValidator({
    param1: 'path:string:true',
    param2: 'body:number',
    param3: 'body:object'
  })
  validator.validate(event)
  const validated = validator.getValues()

  // string value in pathParameters
  const stringValue = validated.param1
  // number value in body
  const numberValue = validated.param2
  // object value in body
  const objectValue = validated.param3

  // result (true: is validation succeeded) 
  const valid = validator.getIsValid()

  // check validation errors, return {} if no errors. 
  const errors = validator.getErrors()
}

```
## configure by shorthand
ApiValidator has a convention of validation.

```text
<location>:<dataType>:<required>

location: Where tha parameter placed in request
dataType: DataType of the parameter
required: if this parameter set to true, the parameter is checked as required. Default: false
```

```typescript
  const validator = new ApiValidator({
    param1: 'path:string:true',
    param2: 'body:number',
    param3: 'body:object'
  })
```


## configure by object
Non conventional way is as follows.

```typescript
  const validator = new ApiValidator({
    param1: {
      location: 'path',
      type: 'string',
      requred: false
    }
  })
```
