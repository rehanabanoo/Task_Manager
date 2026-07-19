// Dom Selectors
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// State Application Storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initial Load execution
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
});

// Add Task Handler
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    
    if (taskText !== '') {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(newTask);
        saveAndRender();
        taskInput.value = '';
    }
});

// Task Actions (Toggle complete & Delete)
taskList.addEventListener('click', (e) => {
    const target = e.target;
    
    // Toggle Status
    if (target.closest('.task-content')) {
        const taskId = parseInt(target.closest('.task-item').dataset.id);
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveAndRender();
    }
    
    // Delete Operation
    if (target.classList.contains('delete-btn')) {
        const taskId = parseInt(target.closest('.task-item').dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveAndRender();
    }
});

// Filtering Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

// Clear Completed Routine
clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
});

// Sync data state helper
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Render Core UI Engine
function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // returns all
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-content">
                <div class="checkbox"></div>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <button class="delete-btn">&times;</button>
        `;
        taskList.appendChild(li);
    });

    // Update Counter metrics
    const pendingCount = tasks.filter(t => !t.completed).length;
    itemsLeft.textContent = `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending`;
}

// Prevent basic XSS injections
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
