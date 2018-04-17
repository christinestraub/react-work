import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as taskActions from '../actions/Task';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import JSONTree from 'react-json-tree';
import moment from 'moment-timezone';
import ReactTable from 'react-table';
// JS (Webpack)
import 'react-table/react-table.css'
const timezoneCity = 'Europe/Luxembourg';

function timeFormatter(cell) {
  if (cell !== undefined && cell > 0) {
    let isoTime = new Date(cell * 1000).toISOString();
    let localTime;
    localTime = moment(isoTime).tz(timezoneCity);
    return localTime.format("hh:mm:ss A");
  } else {
    return '';
  }
}

class TaskTableWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      uploadProgress: 0,
      droppedFile: null,
    };
    // this.intervalId = setInterval(() => {
    //   this.props.getTasks();
    // }, 1000);

    const SOCKET_URL = (process.env.NODE_ENV === 'development') ? 'http://localhost:8097': '';
    let socket = window.io.connect(SOCKET_URL);
    socket.on('news', function (msg) {
      console.log(msg);
      socket.emit('ack', {});
      props.getTasks();
    });
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }
  getTaskStat(tasks) {
    let stat = {
      total: 0,
      queued: 0,
      pending: 0,
      running: 0,
      ended: 0,
    };
    tasks.forEach(task => {
      stat.total++;
      switch(task.status) {
        case 'created':
          stat.queued++;
          break;
        case 'pending':
          stat.pending++;
          break;
        case 'running':
          stat.running++;
          break;
        case 'end':
          stat.ended++;
          break;
        default:
          console.log('unknown status', task.status);
          break;
      }
    });
    return [stat];
  }
  handleRowSelect(row, isSelected, e) {
    if (isSelected) {
      this.getTask(row._id);
    }
  }
  render() {
    const {tasks, task} = this.props;
    const taskStat = this.getTaskStat(tasks);
    const selectRow = {
      mode: 'radio',  // single select
      clickToSelect: true,
      onSelect: this.handleRowSelect,
      getTask: this.props.getTask
    };
    const columns = [{
      header: 'Total',
      accessor: 'total'
    }, {
      header: 'Queued',
      accessor: 'queued',
    },{
      header: 'Pending',
      accessor: 'pending',
    },{
      header: 'Running',
      accessor: 'running',
    }, {
      header: 'Ended',
      accessor: 'ended',
    }];

    return (
      <div>
        <BootstrapTable
          data={ tasks }
          pagination
          selectRow={ selectRow }>
          <TableHeaderColumn dataField='_id' isKey>ID</TableHeaderColumn>
          <TableHeaderColumn dataField='jobName'>Job</TableHeaderColumn>
          <TableHeaderColumn dataField='createTime' dataFormat={timeFormatter}>Create</TableHeaderColumn>
          <TableHeaderColumn dataField='startTime' dataFormat={timeFormatter}>Start</TableHeaderColumn>
          <TableHeaderColumn dataField='endTime' dataFormat={timeFormatter}>End</TableHeaderColumn>
          <TableHeaderColumn dataField='result'>Result</TableHeaderColumn>
          <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
        </BootstrapTable>
        <ReactTable
          pageSize={1}
          showPagination={false}
          data={taskStat}
          columns={columns}
        />
        <div style={{textAlign: 'left'}}>
          <JSONTree data={ task }/>
        </div>
      </div>
    );
  }
}

class TaskTableWidgetContainer extends Component {
  static propTypes = {
    tasks: PropTypes.array,
    task: PropTypes.object,
    loaded: PropTypes.bool,
    loading: PropTypes.bool,
    err: PropTypes.object,
    dispatch: PropTypes.func.isRequired
  };

  render() {
    const { tasks, task, dispatch, loaded, loading, err } = this.props;
    return <TaskTableWidget
      tasks={tasks}
      task={task}
      loading={loading}
      loaded={loaded}
      err={err}
      dispatch={dispatch}
      {...bindActionCreators({
        ...taskActions,
      }, dispatch)} />;
  }
}

TaskTableWidgetContainer = connect(state => ({
  tasks: state.apiTasks.get('tasks'),
  task: state.apiTasks.get('task'),
}))(TaskTableWidgetContainer);

export default TaskTableWidgetContainer;
