import React, {Component, PropTypes} from 'react';
import $ from 'jquery';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {ButtonGroup, Button, FormGroup, ControlLabel, FormControl, ProgressBar} from 'react-bootstrap';
import ReactJson from 'react-json-view';
import * as uploadActions from '../actions/Upload';
import * as jobActions from '../actions/Job';
import * as joinActions from '../actions/Join';

const Dropzone = require('react-dropzone');

class FileUploadWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      files: [],
      uploadProgress: 0,
      droppedFile: null,
    };
  }
  componentWillMount() {
    this.props.getJobs();
  }
  componentDidMount() {
  }
  uploadFile(file) {
    let job = $('#job').val();
    let that = this;
    this.props.uploadFile(job, file, true, (progressEvent) => {
      // upload progress handler
      let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
      that.setState({uploadProgress: percentCompleted});
    });
  }
  onDrop(files) {
    this.setState({
      files: files,
      droppedFile: files[0]
    });
  }
  onOpenClick = () => {
    this.refs.dropzone.open();
  };
  onRemoveClick = () => {
    const {files} = this.state;
    if (!files.length) {
      return;
    }
    this.setState({
      files: [],
      droppedFile: null
    })
  };
  onUploadClick = () => {
    if (this.state.droppedFile) {
      this.uploadFile(this.state.droppedFile);
    }
  };
  onJoinClick = () => {
    this.props.join();
  };
  render() {
    const {jobs, uploadResult, joinResult} = this.props;
    const {droppedFile, uploadProgress} = this.state;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Select Job</ControlLabel>
          <FormControl id="job" componentClass="select" placeholder="select">
            {
              jobs.map((job, i) =>
                <option key={`job_${i}`} value={job}>{job}</option>
              )
            }
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Upload File</ControlLabel>
          <Dropzone ref="dropzone" onDrop={this.onDrop.bind(this)}>
            <div>
              Try dropping some files here, or click to select files to upload.
            </div>
          </Dropzone>
          <FormGroup>
            <ControlLabel>Selected File</ControlLabel>
            <FormControl.Static>{droppedFile && droppedFile.name}</FormControl.Static>
          </FormGroup>
        </FormGroup>
        <FormGroup>
          <ProgressBar striped bsStyle="success" now={uploadProgress} />
        </FormGroup>
        <FormGroup>
          <ButtonGroup>
            <Button bsStyle="primary" onClick={this.onOpenClick}>Open</Button>
            <Button bsStyle="primary" onClick={this.onRemoveClick}>Remove</Button>
            <Button bsStyle="primary" onClick={this.onUploadClick}>Upload</Button>
            <Button bsStyle="primary" onClick={this.onJoinClick}>Join</Button>
          </ButtonGroup>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Upload Response</ControlLabel>
          {
            uploadResult && <ReactJson src={uploadResult} />
          }
        </FormGroup>
        <FormGroup>
          <ControlLabel>Join Response</ControlLabel>
          {
            joinResult && <ReactJson src={joinResult} />
          }
        </FormGroup>
      </div>
    );
  }
}

class FileUploadWidgetContainer extends Component {
  static propTypes = {
    uploadResult: PropTypes.object,
    joinResult: PropTypes.object,
    jobs: PropTypes.array,
    loaded: PropTypes.bool,
    loading: PropTypes.bool,
    err: PropTypes.object,
    dispatch: PropTypes.func.isRequired
  };

  render() {
    const { jobs, uploadResult, joinResult, dispatch, loaded, loading, err } = this.props;
    return <FileUploadWidget
      jobs={jobs}
      uploadResult={uploadResult}
      joinResult={joinResult}
      loading={loading}
      loaded={loaded}
      err={err}
      dispatch={dispatch}
      {...bindActionCreators({
        ...uploadActions,
        ...jobActions,
        ...joinActions,
      }, dispatch)} />;
  }
}

FileUploadWidgetContainer = connect(state => ({
  jobs: state.apiJobs.get('jobs'),
  uploadResult: state.apiUpload.get('uploadResult'),
  joinResult: state.apiJoin.get('joinResult'),
}))(FileUploadWidgetContainer);

export default FileUploadWidgetContainer;