let tasks = [];
let jingleSound = new Audio('jingle.mp3');

document.addEventListener('DOMContentLoaded', function () {
    loadTasksFromStorage();
    updateProgress();

    // Add event listener to Add Task button
    document.getElementById('add-button').addEventListener('click', addTask);

    // Add event listener for exporting tasks
    document.getElementById('export-button').addEventListener('click', exportTasks);

    // Add event listener for importing tasks
    document.getElementById('import-file').addEventListener('change', importTasks);
    
    // Initialize sortable task list
    initializeSortable();
});

function initializeSortable() {
    new Sortable(document.getElementById('incomplete-task-list'), {
        animation: 150,
        onEnd: function (evt) {
            // Reorder tasks array based on the new order
            const item = tasks.splice(evt.oldIndex, 1)[0];
            tasks.splice(evt.newIndex, 0, item);
            saveTasksToStorage();
        }
    });
}

function addTask() {
    const taskInput = document.getElementById('new-task').value;
    const dueDateTime = document.getElementById('due-date-time').value;
    const priority = document.getElementById('priority').value;
    const category = document.getElementById('category').value;
    const recurring = document.getElementById('recurring').value;

    if (!taskInput.trim()) {
        alert("Task cannot be empty!");
        return;
    }

    if (!dueDateTime) {
        alert("Please select a due date and time.");
        return;
    }

    const task = {
        text: taskInput,
        completed: false,
        dueDate: dueDateTime,
        priority: priority,
        category: category,
        recurring: recurring
    };

    tasks.push(task);
    saveTasksToStorage();
    renderTasks();
    updateProgress();

    // Clear the input fields after adding
    document.getElementById('new-task').value = '';
    document.getElementById('due-date-time').value = '';
    document.getElementById('priority').value = 'low';
    document.getElementById('category').value = '';
    document.getElementById('recurring').value = 'none';
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasksToStorage();
    renderTasks();
    updateProgress();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasksToStorage();
    renderTasks();
    updateProgress();
}

function editTask(index) {
    const taskText = prompt("Edit your task:", tasks[index].text);
    if (taskText !== null && taskText.trim() !== '') {
        tasks[index].text = taskText.trim();
        saveTasksToStorage();
        renderTasks();
    }
}

function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    renderTasks();
    updateProgress();
}

function renderTasks() {
    const incompleteTaskList = document.getElementById('incomplete-task-list');
    const completedTaskList = document.getElementById('completed-task-list');

    incompleteTaskList.innerHTML = ''; // Clear incomplete tasks
    completedTaskList.innerHTML = ''; // Clear completed tasks

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task ${task.priority}-priority`;

        const dueDateDisplay = task.dueDate ? ` (Due: ${new Date(task.dueDate).toLocaleString()})` : '';
        const categoryDisplay = task.category ? ` - ${task.category}` : '';
        const recurringDisplay = task.recurring !== 'none' ? ` [Repeats: ${task.recurring}]` : '';

        li.innerHTML = `
            <span class="${task.completed ? 'completed-task' : ''}" onclick="toggleTask(${index})">${task.text}${dueDateDisplay}${categoryDisplay}${recurringDisplay}</span>
            <div>
                <button class="complete" onclick="toggleTask(${index})">${task.completed ? 'Undo' : 'Mark as Done'}</button>
                <button class="edit" onclick="editTask(${index})">Edit</button>
                <button class="delete" onclick="deleteTask(${index})">Delete</button>
            </div>
        `;

        if (task.completed) {
            completedTaskList.appendChild(li);
        } else {
            incompleteTaskList.appendChild(li);
        }
    });

    initializeSortable();  // Re-initialize sortable after rendering
}

function updateProgress() {
    const progressBar = document.getElementById('progress');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    if (totalTasks === 0) {
        progressBar.style.width = '0%';
    } else {
        const progressPercent = (completedTasks / totalTasks) * 100;
        progressBar.style.width = progressPercent + '%';
        
        // Check if progress bar is full and play jingle
        if (progressPercent === 100) {
            jingleSound.play();
        }
    }
}

function exportTasks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tasks.json");
    downloadAnchor.click();
}

function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const importedTasks = JSON.parse(e.target.result);
        tasks = importedTasks;
        saveTasksToStorage();
        renderTasks();
        updateProgress();
    };
    reader.readAsText(file);
}
// Function to toggle the visibility of the gradient control panel
function toggleGradientControls() {
    var controls = document.getElementById('gradientControls');
    controls.style.display = (controls.style.display === 'none' ? 'block' : 'none');
}

// Function to apply the selected gradient as the background
function applyGradient() {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    document.body.style.backgroundImage = `linear-gradient(${color1}, ${color2})`;
    document.body.style.backgroundSize = "cover";
}
