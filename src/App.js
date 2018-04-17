import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {Grid, Row, Col} from 'react-bootstrap';
import FileUploadWidget from './components/FileUploadWidget';
import TaskTableWidget from './components/TaskTableWidget';

class App extends Component {
  componentWillMount() {
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Grid>
            <Row>
              <Col xs={4}/>
              <Col xs={4}>
                <img src={logo} className="App-logo" alt="logo" />
              </Col>
              <Col xs={4}/>
            </Row>
          </Grid>
        </div>
        <div style={{margin: '10px'}}>
          <Grid>
            <Row>
              <Col xs={3}>
                <FileUploadWidget/>
              </Col>
              <Col xs={9}>
                <TaskTableWidget/>
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
