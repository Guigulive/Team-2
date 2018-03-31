import React, { Component } from 'react'
import { Table, Button, Modal, Form, InputNumber, Input, message, Popconfirm } from 'antd';

import EditableCell from './EditableCell';

const FormItem = Form.Item;

const columns = [{
  title: '地址',
  dataIndex: 'address',
  key: 'address',
}, {
  title: '薪水',
  dataIndex: 'salary',
  key: 'salary',
}, {
  title: '上次支付',
  dataIndex: 'lastPaidDay',
  key: 'lastPaidDay',
}, {
  title: '操作',
  dataIndex: '',
  key: 'action'
}];

class EmployeeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      employees: [],
      showModal: false
    };

    columns[1].render = (text, record) => (
      <EditableCell
        value={text}
        onChange={ this.updateEmployee.bind(this, record.address) }
      />
    );

    columns[3].render = (text, record) => (
      <Popconfirm title="你确定删除吗?" onConfirm={() => this.removeEmployee(record.address)}>
        <a href="#">Delete</a>
      </Popconfirm>
    );
  }

  componentDidMount() {
    const { payroll } = this.props;
    const updateInfo = (error, result) => {
      if(error){
        return
      }
      this.loadEmployees()
    };

    this.newEmployeeEvent = payroll.NewEmployee(updateInfo);
    this.updateEmployeeEvent = payroll.UpdateEmployee(updateInfo);
    this.removeEmployeeEvent = payroll.RemoveEmployee(updateInfo);

    this.loadEmployees();
  }

  componentWillUnmount() {
    this.newEmployeeEvent.stopWatching();
    this.updateEmployeeEvent.stopWatching();
    this.removeEmployeeEvent.stopWatching();
  }

  loadEmployees = () => {
    const { payroll, account, web3 } = this.props;
    payroll.checkInfo.call({
      from: account
    }).then((result) => {
      const employeeCount = result[2].toNumber();

      if (employeeCount === 0) {
        this.setState({loading: false});
        return;
      }

      const requests = [];
      for(let i = 0; i < employeeCount; i++ ){
          requests.push(payroll.checkEmployee.call(i, {
              from: account
          }))
      }
      Promise.all(requests).then(resps => {
          const employees = resps.map(res => ({
               key: res[0],
               address: res[0],
               salary: web3.fromWei(res[1].toNumber()),
               lastPaidDay: new Date(res[2].toNumber() * 1000).toString()
          }));
  
          this.setState({
              employees,
              loading: false,
          })
      });

    }); 
  }

  addEmployee = () => {
    const { payroll, account, web3 } = this.props;
    const { address, salary, employees } = this.state;
    payroll.addEmployee(address, salary, {
        from: account,
        gas: 210000
    }).then((result) => {

      this.setState({
        loading: false,
        showModal: false
      });
      return payroll.employees.call(address,{
        from: account
      });
    }).then((result) => {
      this.setState(preState => ({
        employees: [...preState.employees, (result) => {
          return {
            key: result[0],
            address : result[0],
            salary  : web3.fromWei(result[1].toNumber(), 'ether'),
            lastPaidDay : (new Date(result[2].toNumber() * 1000)).toString(),
          }
        }],
        address: null,
        salary: null,
      })); 

    })

  }

  updateEmployee = (address, salary) => {
    const { payroll, account, web3 } = this.props;
    const { employees } = this.state;
    payroll.updateEmployee(address, salary,{
        from: account,
        gas: 310000
    }).then((result) => {
        this.setState({
            employees: employees.filter((x) => x.address !== address),
        });
        return payroll.employees.call(address, {
          from: account,
        });
    }).then((result) => {
      this.setState(preState => ({
        employees: [...preState.employees, (result) => {
          return {
            key: result[0],
            address : result[0],
            salary  : web3.fromWei(result[1].toNumber(), 'ether'),
            lastPaidDay : (new Date(result[2].toNumber() * 1000)).toString(),
          }
        }],
      }));
    }).catch(() => {
        message.error('你没有足够的金额');
    })
  }

  removeEmployee = (employeeId) => {
    const { payroll, account } = this.props;
    const { employees } = this.state;
    payroll.removeEmployee(employeeId, {
        from: account,
        gas: 310000
    }).then(() => {
        this.setState({
            employees: employees.filter(employee => employee.address !== employee),
        });
    }).catch(() => {
        message.error('你没有足够的金额');
    })
  }

  renderModal() {
      return (
      <Modal
          title="增加员工"
          visible={this.state.showModal}
          onOk={this.addEmployee}
          onCancel={() => this.setState({showModal: false})}
      >
        <Form>
          <FormItem label="地址">
            <Input
              onChange={ev => this.setState({address: ev.target.value})}
            />
          </FormItem>

          <FormItem label="薪水">
            <InputNumber
              min={1}
              onChange={salary => this.setState({salary})}
            />
          </FormItem>
        </Form>
      </Modal>
    );

  }

  render() {
    const { loading, employees } = this.state;
    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({showModal: true})}
        >
          增加员工
        </Button>

        {this.renderModal()}

        <Table
          loading={loading}
          dataSource={employees}
          columns={columns}
        />
      </div>
    );
  }
}

export default EmployeeList