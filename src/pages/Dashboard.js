import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
    fetchTasks();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const res = await axios.get('https://task-manager-backend-hazel-three.vercel.app/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(res.data.username);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const res = await axios.get('https://task-manager-backend-hazel-three.vercel.app/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      await axios.put(
        `https://task-manager-backend-hazel-three.vercel.app/api/tasks/${editingTask._id}`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTasks = tasks.map((task) =>
        task._id === editingTask._id
          ? { ...task, title: editTitle, description: editDescription }
          : task
      );
      setTasks(updatedTasks);

      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
    } catch (err) {
      console.error('Failed to update task:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      await axios.delete(`https://task-manager-backend-hazel-three.vercel.app/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedTasks = tasks.filter((task) => task._id !== taskId);
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleAddTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const res = await axios.post(
        'https://task-manager-backend-hazel-three.vercel.app/api/tasks',
        { title: newTaskTitle, description: newTaskDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks([...tasks, res.data]);
      setIsAddTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (err) {
      console.error('Failed to add task:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="greeting">Hello {username}</div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <h1 className="dashboard-title">Dashboard</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="task-list"
            >
              {tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="task-card"
                    >
                      <div className="task-content">
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-description">{task.description}</p>
                      </div>
                      <div className="task-actions">
                        <button className="edit" onClick={() => handleEdit(task)}>
                          Edit
                        </button>
                        <button className="delete" onClick={() => handleDelete(task._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        className="add-task-button"
        onClick={() => setIsAddTaskModalOpen(true)}
      >
        +
      </button>

      {editingTask && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Task</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task Title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task Description"
            />
            <div className="modal-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setEditingTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isAddTaskModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Task</h2>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task Title"
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task Description"
            />
            <div className="modal-buttons">
              <button onClick={handleAddTask}>Add Task</button>
              <button onClick={() => setIsAddTaskModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;