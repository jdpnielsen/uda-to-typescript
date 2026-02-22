/**
 * Built-in datatype handlers that can be spread and extended in consumer config.
 */
export { dataTypeMap as dataTypes } from './lib/datatypes';

/**
 * Shape of a datatype handler used when extending `dataTypes`.
 */
export type { HandlerConfig } from './lib/datatypes';

/**
 * Helper for authoring strongly typed `udaconvert` config files.
 */
export { defineConfig, type UDAConvertConfiguration } from './lib/define-config';
