
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let editingId = null;

const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const taskDate = document.getElementById("taskDate");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");

const today = new Date();
today.setHours(0, 0, 0, 0);

document.getElementById("todayDate").textContent =
    "Today: " + today.toLocaleDateString();

const messages = [
    "Small steps every day lead to big results!",
    "Believe in yourself and keep learning!",
    "Your future is created by what you do today!",
    "Stay focused and achieve your goals!",
    "Every completed task is a step towards success!"
];

document.getElementById("motivation").textContent =
    messages[Math.floor(Math.random() * messages.length)];

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function addTask() {
    const name = taskInput.value.trim();
    const subject = subjectInput.value;
    const date = taskDate.value;
    const priority = priorityInput.value;

    if (!name || !subject || !date) {
        alert("Please fill all task details!");
        return;
    }

    if (date < getTodayString()) {
        alert("Please select today or a future date!");
        return;
    }

    if (editingId !== null) {
        tasks = tasks.map(task => {
            if (task.id === editingId) {
                return {
                    ...task,
                    name,
                    subject,
                    date,
                    priority
                };
            }
            return task;
        });

        editingId = null;
        document.getElementById("addBtn").textContent = "Add Task";
    } else {
        tasks.push({
            id: Date.now(),
            name,
            subject,
            date,
            priority,
            completed: false
        });
    }

    saveTasks();
    clearForm();
    displayTasks();
}

function clearForm() {
    taskInput.value = "";
    subjectInput.value = "";
    taskDate.value = "";
    priorityInput.value = "Medium";
}

function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function displayTasks() {
    taskList.innerHTML = "";

    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    const filter = document.getElementById("filterInput").value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.name.toLowerCase().includes(search) ||
            task.subject.toLowerCase().includes(search);

        const overdue =
            !task.completed && task.date < getTodayString();

        let matchesFilter = true;

        if (filter === "Pending") {
            matchesFilter = !task.completed;
        } else if (filter === "Completed") {
            matchesFilter = task.completed;
        } else if (filter === "Overdue") {
            matchesFilter = overdue;
        }

        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<div class="empty">📚 No tasks found. Add a new task!</div>';
    }

    filteredTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";

        if (task.completed) {
            card.classList.add("done");
        }

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h3");
        title.textContent = task.name;

        const subject = document.createElement("p");
        subject.textContent = "📖 Subject: " + task.subject;

        const date = document.createElement("p");
        date.textContent = "📅 Deadline: " + task.date;

        const isOverdue =
            !task.completed && task.date < getTodayString();

        if (isOverdue) {
            date.classList.add("overdue-text");
            date.textContent += " (Overdue!)";
        }

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " Priority";

        info.append(title, subject, date, priority);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeBtn = document.createElement("button");
        completeBtn.className = "complete-btn";
        completeBtn.textContent =
            task.completed ? "Undo" : "Complete";

        completeBtn.onclick = () => toggleTask(task.id);

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editTask(task.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        actions.append(completeBtn, editBtn, deleteBtn);
        card.append(info, actions);

        taskList.appendChild(card);
    });

    updateStats();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
        }
        return task;
    });

    saveTasks();
    displayTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    taskInput.value = task.name;
    subjectInput.value = task.subject;
    taskDate.value = task.date;
    priorityInput.value = task.priority;

    editingId = id;

    document.getElementById("addBtn").textContent = "Update Task";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    if (editingId === id) {
        editingId = null;
        clearForm();
        document.getElementById("addBtn").textContent = "Add Task";
    }

    saveTasks();
    displayTasks();
}

function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const overdue = tasks.filter(
        task => !task.completed &&
        task.date < getTodayString()
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("overdueTasks").textContent = overdue;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progress").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "% Completed";
}

function saveGoal() {
    const goal = Number(document.getElementById("goalInput").value);

    if (!Number.isInteger(goal) || goal < 1 || goal > 24) {
        alert("Please enter a study goal between 1 and 24 hours!");
        return;
    }

    localStorage.setItem("studyGoal", goal);

    showGoal();
    alert("Your daily study goal has been saved!");
}

function showGoal() {
    const goal = localStorage.getItem("studyGoal");

    document.getElementById("goalDisplay").textContent =
        goal
            ? "🎯 Your daily goal: " + goal + " hours"
            : "Your daily goal: Not set";
}

function toggleTheme() {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("studyTheme", isDark ? "dark" : "light");

    document.getElementById("themeBtn").textContent =
        isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function loadTheme() {
    const theme = localStorage.getItem("studyTheme");

    if (theme === "dark") {
        document.body.classList.add("dark");
        document.getElementById("themeBtn").textContent =
            "☀️ Light Mode";
    }
}

loadTheme();
showGoal();
displayTasks();
