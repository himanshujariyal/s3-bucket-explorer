import request from 'superagent';
import _ from 'lodash';
import { handle } from './errorHandle';

import { S3_URL } from './constants';

export const list = function list() {
  let req = request.get(S3_URL);
  
  return req.then(response => response.body, (error) => { handle(error); });
};

export default {
  list,
};
