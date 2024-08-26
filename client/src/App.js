import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import './App.css'; 

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      const result = await axios.get('http://localhost:5000/tasks');
      // Sort tasks by start date
      const sortedTasks = result.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setTasks(sortedTasks);
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (new Date(taskStartTime) >= new Date(taskEndDate)) {
      setError('Start date must be earlier than end date');
      return;
    }
    setError('');
    const result = await axios.post('http://localhost:5000/tasks', {
      name: taskName,
      description: taskDescription,
      startTime: taskStartTime,
      endDate: taskEndDate,
      completed: false
    });
    setTasks([...tasks, result.data].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    setTaskName('');
    setTaskDescription('');
    setTaskStartTime('');
    setTaskEndDate('');
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/tasks/${id}`);
    setTasks(tasks.filter(task => task._id !== id));
  };

  const startEditing = (task) => {
    setEditId(task._id);
    setEditText({
      name: task.name,
      description: task.description,
      startTime: task.startTime,
      endDate: task.endDate,
    });
  };

  const editTask = async () => {
    if (new Date(editText.startTime) >= new Date(editText.endDate)) {
      setError('Start date must be earlier than end date');
      return;
    }
    setError('');
    await axios.put(`http://localhost:5000/tasks/${editId}`, {
      ...editText,
      completed: false,
    });
    setTasks(tasks.map(task => (task._id === editId ? { ...task, ...editText } : task)).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    setEditId(null);
    setEditText({});
  };

  return (
    <Container className="p-5" style={{ background: 'linear-gradient(135deg, #8093f1,  #b388eb)', borderRadius: '10px' }}>
      <h1 className="text-center mb-4">To-Do List</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="datetime-local"
            value={taskStartTime}
            onChange={(e) => setTaskStartTime(e.target.value)}
            placeholder="Start Time"
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="date"
            value={taskEndDate}
            onChange={(e) => setTaskEndDate(e.target.value)}
            placeholder="End Date"
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Control
            as="textarea"
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Task Description"
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={addTask}>Add Task</Button>
        </Col>
      </Row>
      <ul className="list-unstyled" style={{ width: '90%', margin: '0 auto' }}>
        {tasks.map(task => (
          <li key={task._id} className="task-item d-flex flex-row mb-2">
            {editId === task._id ? (
              <div className="d-flex flex-column w-100">
                <Form.Control
                  type="text"
                  value={editText.name}
                  onChange={(e) => setEditText({ ...editText, name: e.target.value })}
                  placeholder="Task Name"
                  className="mb-2"
                />
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editText.description}
                  onChange={(e) => setEditText({ ...editText, description: e.target.value })}
                  placeholder="Task Description"
                  className="mb-2"
                />
                <Form.Control
                  type="datetime-local"
                  value={editText.startTime}
                  onChange={(e) => setEditText({ ...editText, startTime: e.target.value })}
                  placeholder="Start Time"
                  className="mb-2"
                />
                <Form.Control
                  type="date"
                  value={editText.endDate}
                  onChange={(e) => setEditText({ ...editText, endDate: e.target.value })}
                  placeholder="End Date"
                  className="mb-2"
                />
                <Button variant="success" onClick={editTask} className="mb-2">Save</Button>
              </div>
            ) : (
              <div className="task-content d-flex w-100">
                <div className="task-details d-flex flex-column flex-shrink-1" style={{ flexBasis: '20%',marginRight: '20px'  }}>
                  <strong>{task.name}</strong>
                  Start: {new Date(task.startTime).toLocaleString()}<br />
                  End: {new Date(task.endDate).toLocaleDateString()}
                </div><br />
                <div className="task-description flex-grow-1" style={{ flexBasis: '40%', marginRight: '20px' }}>
                 {task.description}
                 </div>
                 <div className="task-buttons d-flex flex-column" style={{ flexBasis: '15%' }}>
                  <Button variant="warning" onClick={() => startEditing(task)} className="mb-2">Edit</Button>
                  <Button variant="danger" onClick={() => deleteTask(task._id)}>Delete</Button>
                  </div>

              </div>
            )}
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default App;
