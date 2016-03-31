import API from './API';

export const NectarineAPI = {
  rest: ( server, port, schema = 'http' ) => {
    const api = new API( schema, server, port );
    return {

      frimFram: api.endpoint( 'get', '/api/{frim}/{fram}' )
      // ....
      // TODO: extend this over time

    };
  },

  websocket: null // TODO: Hook socket API layer on here.

}
