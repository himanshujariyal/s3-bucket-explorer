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
import api from '../../api';
import _ from 'lodash';
import shortid from 'shortid';
import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;
import TreeNode from '../../components/TreeNode';
export class Explorer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    // the state has been normalized so that it's easier to update the state
    // atomically.
    this.state = {
      tree: {
        name: 'Explorer',
        id: shortid.generate(),
        isLeaf: false,
        subtree: [],
        nodesFetched: false,
        isOpen: false,
      },
    };
  }

  componentDidMount() {
    AWS.config.update({
      signatureVersion: 'v4',
      accessKeyId: api.secrets.data.accessKeyId,
      secretAccessKey: api.secrets.data.secretAccessKey,
    });
    AWS.config.region = api.secrets.data.region;
    this.fetchBucket(null, '/');
  }

  returnJSONSubTree(data) {
    const leafData = [];
    const folderData = [];
    _.each(data.Contents, (item, index) => {
      leafData[index] = {
        name: item.Key,
        id: shortid.generate(),
        isLeaf: true,
        subtree: [],
        nodesFetched: true,
        isOpen: false,
      };
    });
    _.each(data.CommonPrefixes, (item, index) => {
      folderData[index] = {
        name: item.Prefix,
        id: shortid.generate(),
        isLeaf: false,
        subtree: [],
        nodesFetched: false,
        isOpen: false,
      };
    });
    return leafData.concat(folderData);
  }

  fetchBucket(prefix, delimiter, id) {
    // create the AWS.Request object
    const request = new AWS.S3().listObjects({
      Bucket: 'frontendskills',
      Prefix: !_.isNil(prefix) ? prefix : undefined,
      Delimiter: !_.isNil(delimiter) ? delimiter : undefined,
    }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const formattedData = this.returnJSONSubTree(data);
        this.setState({
          tree: {
            name: 'Explorer',
            id: shortid.generate(),
            isLeaf: true,
            subtree: formattedData,
            nodesFetched: true,
            isOpen: true,
          },
        });
      }
    }
   );
  }

  render() {
    const { onClick } = this.props;
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
        <TreeNode onClick={onClick} tree={this.state.tree} key={this.state.tree.id} />
      </div>
    );
  }
}

const mapStateToProps = selectExplorer();

function mapDispatchToProps(dispatch) {
  return {
    onClick() {
      alert('Clicked');
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Explorer);
