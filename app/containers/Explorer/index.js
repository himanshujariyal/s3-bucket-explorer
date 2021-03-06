/*
 *
 * Explorer
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import selectExplorer from './selectors';
import styles from './styles.css';
import shortid from 'shortid';

import { fetchBucket, TreeNode } from '../../components/TreeNode';

export class Explorer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    // the state has been normalized so that it's easier to update the state
    // atomically.
    this.state = {
      tree: {
        name: 'Explorer',
        id: shortid.generate(),
        prefix: '',
        isLeaf: false,
        subtree: [],
        nodesFetched: false,
        isOpen: false,
        isFetchingNodes: false,
      },
    };
  }

  componentDidMount() {
    fetchBucket('', '/', (formattedData) => {
      this.setState({
        tree: {
          name: 'Explorer',
          prefix: '',
          id: shortid.generate(),
          isLeaf: false,
          subtree: formattedData,
          nodesFetched: true,
          isOpen: true,
          isFetchingNodes: false,
        },
      });
    });
    // debugger;
  }

  render() {
    return (
      <div className={styles.explorer}>
        <Helmet
          title="S3 Bucket Explorer"
          meta={[
            { name: 'description', content: 'A web based folder/bucket explorer in ReactJS framework consuming S3 REST API.' },
          ]}
        />
        <h3>S3 Bucket Explorer</h3>
        <small>A web based folder/bucket explorer in ReactJS framework consuming S3 REST API.</small>
        <div className={styles.container}>
          <TreeNode tree={this.state.tree} key={this.state.tree.id} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = selectExplorer();

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Explorer);
