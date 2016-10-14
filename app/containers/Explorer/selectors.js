import { createSelector } from 'reselect';

/**
 * Direct selector to the explorer state domain
 */
const selectExplorerDomain = () => (state) => state.get('explorer');

/**
 * Other specific selectors
 */


/**
 * Default selector used by Explorer
 */

const selectExplorer = () => createSelector(
  selectExplorerDomain(),
  (substate) => substate.toJS()
);

export default selectExplorer;
export {
  selectExplorerDomain,
};
