import { Generable } from '../../Components';
import { GenerableType, ParameterizedComponent, ParameterSubtype } from '../exports/Mapping';
interface _SchemaObject {
    $id?: string;
    $schema?: string;
    [x: string]: unknown;
}
export interface SchemaObject extends _SchemaObject {
    $id?: string;
    $schema?: string;
    $async?: false;
    [x: string]: unknown;
}
export type GenerableSubtypes = ParameterSubtype | ParameterizedComponent;
export type GenerableSubTypesMap = {
    [GenerableType.CUSTOM_PARAMETER]: {
        [key in GenerableSubtypes]: SchemaObject;
    };
    [GenerableType.CUSTOM_PARAMETERS_LIST]: {
        [key in ParameterizedComponent]: SchemaObject;
    };
};
export type OneOrMoreGenerable = Generable | Generable[];
export {};
