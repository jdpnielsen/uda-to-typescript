/**
 * Helper for authoring strongly typed `udaconvert` config files.
 */
export { defineConfig, UDAConvertConfiguration } from './lib/define-config';

/**
 * Built-in datatype handlers that can be spread and extended in consumer config.
 */
export { dataTypeMap as dataTypes } from './lib/datatypes';

/**
 * Shape of a datatype handler used when extending `dataTypes`.
 */
export { HandlerConfig } from './lib/datatypes';
