import { CommonModel } from '../../../src/models/CommonModel';
import { Interpreter } from '../../../src/interpreter/Interpreter';
import interpretAllOf from '../../../src/interpreter/InterpretAllOf';

describe('Interpretation of discriminator', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('should handle discriminator', () => {
    const pet = { 
      type: 'object', 
      $id: 'Pet', 
      discriminator: 'petType', 
      properties: {
        petType: {
          $id: 'PetType',
          type: 'string'
        }
      },
      additionalProperties: false,
      required: [
        'petType'
      ],
    };
    const cat = { type: 'object', $id: 'Cat' };
    const stickInsect = { 
      type: 'object', 
      $id: 'StickInsect',
      properties: {
        petType: {
          const: 'StickBug'
        }
      }
    };
    const catPet = { allOf: [pet, cat] };
    const stickInsectPet = { allOf: [pet, stickInsect] };
    const schema = {
      type: 'object',
      $id: 'OneOfPet',
      oneOf: [
        catPet,
        stickInsectPet,
      ]
    };

    // console.log(schema);

    const interpreter = new Interpreter();
    const model = interpreter.interpret(schema);

    // interpretAllOf(schema, model, interpreter, { allowInheritance: false });

    // console.log(JSON.stringify(model, null, 2));
    expect(model?.$id).toBe('OneOfPet');
    expect(model?.properties?.petType.$id).toBe('PetType');
    expect(model?.properties?.petType.enum).toEqual(['Cat', 'StickBug']);
  });
});
