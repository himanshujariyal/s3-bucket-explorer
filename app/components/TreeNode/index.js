/**
*
* TreeNode
*
*/

import React from 'react';
import styles from './styles.css';
import shortid from 'shortid';
import _ from 'lodash';
import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;
import api from '../../api';

const returnJSONSubTree = function returnJSONSubTree(data, prefix) {
  const leafData = [];
  const folderData = [];
  _.each(data.Contents, (item, index) => {
    leafData[index] = {
      name: item.Key.replace(prefix, ''),
      prefix: item.Key,
      id: shortid.generate(),
      isLeaf: true,
      subtree: [],
      nodesFetched: false,
      isOpen: false,
    };
  });
  _.each(data.CommonPrefixes, (item, index) => {
    folderData[index] = {
      name: item.Prefix.replace(prefix, ''),
      prefix: item.Prefix,
      id: shortid.generate(),
      isLeaf: false,
      subtree: [],
      nodesFetched: false,
      isOpen: false,
    };
  });
  return leafData.concat(folderData);
};

export const fetchBucket = function fetchBucket(prefix, delimiter, cb) {
  AWS.config.update({
    signatureVersion: 'v4',
    accessKeyId: api.secrets.data.accessKeyId,
    secretAccessKey: api.secrets.data.secretAccessKey,
  });
  AWS.config.region = api.secrets.data.region;

  // create the AWS.Request object
  const request = new AWS.S3().listObjects({
    Bucket: api.secrets.data.bucket,
    Prefix: !_.isNil(prefix) ? prefix : undefined,
    Delimiter: !_.isNil(delimiter) ? delimiter : undefined,
  }, (err, data) => {
    if (err) {
      alert(err);
    } else {
      const formattedData = returnJSONSubTree(data, prefix);
      cb(formattedData);
    }
  }
 );
};

export class TreeNode extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    tree: React.PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);
    const { tree } = props;
    this.state = Object.assign({}, { tree });
  }

  onClickFolder() {
    const { tree } = this.state;
    if (!tree.isLeaf && !tree.nodesFetched) {
      // set fetching true
      this.setState({
        tree: {
          name: tree.name,
          prefix: tree.prefix,
          id: tree.id,
          isLeaf: tree.isLeaf,
          subtree: tree.subtree,
          nodesFetched: true,
          isOpen: true,
          isFetchingNodes: true,
        },
      });
      // Not leaf
      fetchBucket(tree.prefix, '/', (formattedData) => {
        this.setState({
          tree: {
            name: tree.name,
            prefix: tree.prefix,
            id: tree.id,
            isLeaf: tree.isLeaf,
            subtree: formattedData,
            nodesFetched: true,
            isOpen: true,
            isFetchingNodes: false,
          },
        });
      });
    } else if (tree.nodesFetched && !tree.isLeaf) {
      this.setState({
        tree: {
          name: tree.name,
          prefix: tree.prefix,
          id: tree.id,
          isLeaf: tree.isLeaf,
          subtree: tree.subtree,
          nodesFetched: tree.nodesFetched,
          isOpen: !tree.isOpen,
          isFetchingNodes: tree.isFetchingNodes,
        },
      });
    }
  }

  onClickLeaf(key) {
    new AWS.S3().getSignedUrl('getObject', { Bucket: api.secrets.data.bucket, Key: key, Expires: 60 }, (err, url) => {
      const win = window.open(url, '_blank');
      win.focus();
    });
    // new AWS.S3().getObject({ Bucket: api.secrets.data.bucket, Key: key }).on('success', function(response) {
    //   console.log("Key was", response.request.params.Key);
    // }).send();
  }

  render() {
    // debugger;
    const { tree } = this.state;
    let thisNode;
    if (tree.isLeaf) {
      thisNode = (<div onClick={this.onClickLeaf.bind(this, tree.prefix)} className={styles.leafNode}>{tree.name}</div>);
    } else {
      const openFolder = (<span><i className="glyphicon glyphicon-triangle-bottom"></i> <i className="glyphicon glyphicon-folder-open"></i></span>);
      const closeFolder = (<span><i className="glyphicon glyphicon-triangle-right"></i> <i className="glyphicon glyphicon-folder-close"></i></span>);
      thisNode = (
        <div onClick={this.onClickFolder.bind(this)} className={styles.folderNode}>
          {tree.isOpen ? openFolder : closeFolder}
          {' '}
          {tree.name}
          {tree.isFetchingNodes ? <span className={styles.loading}><i className="glyphicon glyphicon-refresh"></i></span> : ' '}
        </div>
      );
    }
    const hiddenStatus = tree.isOpen ? styles.visibleTree : styles.hiddenTree;
    const subNode = tree.subtree.map((node) => {
      return (<div key={node.id} className={hiddenStatus}><TreeNode tree={node} /></div>);
    });
    return (
      <div className={styles.treeNode}>
        {thisNode}
        {subNode}
      </div>
    );
  }
}

export default {
  TreeNode,
  fetchBucket,
};
