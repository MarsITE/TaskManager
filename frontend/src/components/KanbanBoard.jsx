import React, {useEffect, useState} from "react";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {io} from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || "http://localhost:3001";

const API_URL = `${BACKEND_URL}/api/tasks`;
const socket = io(REALTIME_URL);

const columns = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
};

export default function KanbanBoard() {
    const [tasks, setTasks] = useState([]);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => setTasks(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Error fetching tasks:", err);
                setTasks([]);
            });

        socket.on("task-updated", (updatedTask) => {
            setTasks((prev) =>
                prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
        });

        socket.on("task-deleted", (deletedId) => {
            setTasks((prev) => prev.filter((t) => t.id !== deletedId));
        });

        return () => {
            socket.off("task-updated");
            socket.off("task-deleted");
        };
    }, []);

    const updateTaskStatus = async (task) => {
        try {
            await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(task),
            });
            socket.emit("task-updated", task);
        } catch (e) {
            console.error("Error updating task:", e);
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const {source, destination} = result;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const tasksByStatus = {
            TODO: tasks.filter((t) => t.status === "TODO"),
            IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
            DONE: tasks.filter((t) => t.status === "DONE"),
        };

        const [movedTask] = tasksByStatus[source.droppableId].splice(source.index, 1);
        movedTask.status = destination.droppableId;
        tasksByStatus[destination.droppableId].splice(destination.index, 0, movedTask);

        const newTasks = [
            ...tasksByStatus.TODO,
            ...tasksByStatus.IN_PROGRESS,
            ...tasksByStatus.DONE,
        ];

        setTasks(newTasks);
        updateTaskStatus(movedTask);
    };

    const handleCreateTask = async () => {
        const title = prompt("Enter task title:");
        if (!title) return;
        const description = prompt("Enter task description:") || "";

        const newTask = {title, description, status: "TODO"};
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newTask),
        });
        const saved = await res.json();
        setTasks([...tasks, saved]);
    };

    const openDeleteModal = (id) => {
        setTaskToDelete(id);
        setShowModal(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        try {
            await fetch(`${API_URL}/${taskToDelete}`, {method: "DELETE"});
            setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
            socket.emit("task-deleted", taskToDelete);
        } catch (e) {
            console.error("Error deleting task:", e);
        } finally {
            setShowModal(false);
            setTaskToDelete(null);
        }
    };

    return (
        <div className="kanban-board">
            <h1>Kanban Board</h1>
            <button onClick={handleCreateTask} className="add-task">
                + Add Task
            </button>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="kanban-columns">
                    {Object.keys(columns).map((status) => (
                        <Droppable key={status} droppableId={status}>
                            {(provided) => (
                                <div
                                    className="kanban-column"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{columns[status]}</h2>
                                    {tasks
                                        .filter((t) => t.status === status)
                                        .map((task, index) => (
                                            <Draggable
                                                key={task.id.toString()}
                                                draggableId={task.id.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        className="kanban-task"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <div className="task-header">
                                                            <strong>{task.title}</strong>
                                                            <button
                                                                className="delete-btn"
                                                                onClick={() => openDeleteModal(task.id)}
                                                                title="Delete task"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                        <p>{task.description}</p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* 🪟 Модальне вікно */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Are you sure you want to delete this task?</h3>
                        <div className="modal-buttons">
                            <button className="confirm-btn" onClick={confirmDeleteTask}>
                                Yes, delete
                            </button>
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
