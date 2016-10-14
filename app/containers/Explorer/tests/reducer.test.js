import expect from 'expect';
import explorerReducer from '../reducer';
import { fromJS } from 'immutable';

describe('explorerReducer', () => {
  it('returns the initial state', () => {
    expect(explorerReducer(undefined, {})).toEqual(fromJS({}));
  });
});
