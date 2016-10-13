/**
*
* TreeNode
*
*/

import React from 'react';

import styles from './styles.css';

class TreeNode extends React.Component { // eslint-disable-line react/prefer-stateless-function
  propTypes: {
    tree: React.PropTypes.any.isRequired,
    onClick: React.PropTypes.func.isRequired,
  };

  render() {
    // debugger;
    const { tree, onClick } = this.props;
    let thisNode;
    if (tree.isLeaf) {
      thisNode = (<div className={styles.leafNode}>{tree.name}</div>);
    } else {
      thisNode = (
        <div className={styles.folderNode}>{tree.name}</div>
      );
    }

    const subNode = tree.subtree.map((node) => <TreeNode key={node.id} onClick={onClick} tree={node} />);
    return (
      <div className={styles.treeNode}>
        {thisNode}
        {subNode}
      </div>
    );
  }
}

export default TreeNode;
