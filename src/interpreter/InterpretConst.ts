import { Draft4Schema, CommonModel, AsyncapiV2Schema } from '../models';
import { InterpreterSchemaType } from './Interpreter';
import { inferTypeFromValue } from './Utils';

function getDiscriminator(schema: AsyncapiV2Schema) {
  if (!schema.allOf) {
    return;
  }

  let discriminator: AsyncapiV2Schema | undefined;
  let discriminatorItem: AsyncapiV2Schema | undefined;

  for (const allOfSchema of schema.allOf) {
    if (typeof allOfSchema === 'boolean') { return false; }

    if (allOfSchema.discriminator) {
      discriminator = allOfSchema;
    } else {
      discriminatorItem = allOfSchema;
    }
  }

  if (!discriminatorItem?.$id) {
    return;
  }

  console.log(discriminator?.discriminator);

  return {
    const: discriminatorItem.$id,
  };
}

/**
 * Interpreter function for const keyword for draft version > 4
 * 
 * @param schema 
 * @param model
 */
export default function interpretConst(schema: InterpreterSchemaType, model: CommonModel): void {
  if (schema instanceof Draft4Schema || typeof schema === 'boolean') { return; }

  const discriminator = getDiscriminator(schema as AsyncapiV2Schema);
  
  let schemaConst: any;

  if (discriminator) {
    console.log('interpretConst.discriminator', discriminator);
    schemaConst = discriminator.const;
    model.addEnum(discriminator.const);
  }
  
  if (schema.const) {
    console.log('interpretConst.const/enum', schema);
    schemaConst = schema.const;
    model.enum = [schemaConst];
  }

  if (!schemaConst) {
    return;
  }
  
  //If schema does not contain type interpret the schema
  if (schema.type === undefined) {
    const inferredType = inferTypeFromValue(schemaConst);
    console.log("inferredType", inferredType);
    if (inferredType !== undefined) {
      model.setType(inferredType);
      console.log('model.enum', model.$id, model.type, model.enum);
    }
  }
}
