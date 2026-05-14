
import { IAcElementMetadata } from "../interfaces/ac-element-metadata.interface";

export function AcElement(metadata: IAcElementMetadata) {
  return function (constructor: Function) { };
}