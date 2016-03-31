import { NectarineAPI } from '@nectarine-dispatch/NectarineAPI';

const endpoints = NectarineAPI.rest( 'localhost', 5000 ); // TODO: put these values in a config somewhere, or an env var.
const { frimFram } = endpoints;

export { endpoints as default, frimFram };
