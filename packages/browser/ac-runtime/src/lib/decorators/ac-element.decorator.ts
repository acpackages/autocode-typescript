import { AC_ELEMENT_METADATA_KEY } from "../consts/symbols.const";
import { acElementRegistry } from "../core/ac-element-registry";
import { IAcElementMetadata } from "../interfaces/ac-element-metadata.interface";

export function AcElement(metadata: IAcElementMetadata) {
  return function (constructor: Function) {
    (constructor as any)[AC_ELEMENT_METADATA_KEY] = metadata;
    acElementRegistry.register(metadata.selector, constructor, metadata);
  };
}

export function getAcElementMetadata(target: any): IAcElementMetadata {
    // Handle both constructor and instance
    const constructor = target.prototype ? target : target.constructor;
    return (constructor as any)[AC_ELEMENT_METADATA_KEY];
}