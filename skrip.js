document.addEventListener("DOMContentLoaded", function () {
    const todoInput = document.getElementById("todoInput");
    const addButton = document.getElementById("addButton");
    const dueDateInput = document.getElementById("dueDateInput");
    const lowBox = document.getElementById("lowBox");
    const mediumBox = document.getElementById("mediumBox");
    const highBox = document.getElementById("highBox");
    const completedTasksList = document.getElementById("completedTasksList").querySelector("tbody");

    addButton.addEventListener("click", addTodo);

    function addTodo() {
        const todoText = todoInput.value.trim();
        const priority = getSelectedPriority();
        const dueDate = dueDateInput.value;

        // Get the accurate current date from the internet
        fetch('https://worldtimeapi.org/api/ip')
            .then(response => response.json())
            .then(data => {
                const currentDate = new Date(data.utc_datetime);
                const priorityBox = getPriorityBox(priority);
                const listItem = createTodoItem(todoText, dueDate, currentDate);
                priorityBox.querySelector("table tbody").appendChild(listItem);
                todoInput.value = "";
                calculateDaysRemaining();
            })
            .catch(error => {
                console.error('Error fetching current date:', error);
            });
    }

    function createTodoItem(todoText, dueDate, currentDate) {
        const row = document.createElement("tr");
        const daysRemainingCell = document.createElement("td");

        // Calculate the number of days remaining
        const dueDateTime = new Date(dueDate);
        const timeDifference = dueDateTime - currentDate;
        const daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        daysRemainingCell.textContent =
            daysRemaining >= 0 ? `${daysRemaining} days remaining` : "Expired";
        daysRemainingCell.style.display = "table-cell";

        row.innerHTML = `
            <td><input type="checkbox" class="complete-checkbox"></td>
            <td class="todo-text">${todoText}</td>
            <td class="days-remaining"></td>
            <td>
                <button class="edit-button">Edit</button>
                <button class="delete-button">Delete</button>
            </td>
        `;

        row.querySelector(".days-remaining").appendChild(daysRemainingCell);

        return row;
    }

    function getSelectedPriority() {
        const prioritySelect = document.getElementById("prioritySelect");
        return prioritySelect.value;
    }

    function getPriorityBox(priority) {
        switch (priority) {
            case "Low":
                return lowBox;
            case "Medium":
                return mediumBox;
            case "High":
                return highBox;
            default:
                console.error("Invalid priority");
                return null;
        }
    }

    function calculateDaysRemaining() {
        const todoItems = document.querySelectorAll(".priority-box table tbody tr");

        todoItems.forEach(function (row) {
            const daysRemainingCell = row.querySelector(".days-remaining td");

            if (daysRemainingCell) {
                const daysRemainingText = daysRemainingCell.textContent;
                const daysRemaining = parseInt(daysRemainingText, 10);

                daysRemainingCell.textContent =
                    daysRemaining >= 0 ? `${daysRemaining} days remaining` : "Expired";

                if (daysRemaining <= 0) {
                    showExpiredTaskModal(row);
                }
            }
        });
    }

    // Add event listeners using event delegation
    document.addEventListener("click", function (event) {
        const target = event.target;

        if (target.classList.contains("complete-checkbox")) {
            completeTask(target);
        } else if (target.classList.contains("edit-button")) {
            editTask(target.parentElement.parentElement);
        } else if (target.classList.contains("delete-button")) {
            deleteTask(target.parentElement.parentElement);
        }
    });

    function completeTask(checkbox) {
        const row = checkbox.parentElement.parentElement;
        const taskName = row.querySelector(".todo-text").textContent;
        const priority = getSelectedPriority();
        const confirmation = confirm(
            `Are you sure you want to mark "${taskName}" as complete?`
        );

        if (confirmation) {
            row.remove();
            const completedRow = createCompletedTaskRow(taskName, priority);
            completedTasksList.appendChild(completedRow);
        }
    }

    function createCompletedTaskRow(taskName, priority) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${taskName}</td>
            <td class="priority-cell" style="background-color: ${getPriorityColor(
                priority
            )};">${priority}</td>
        `;
        return row;
    }

    function deleteTask(row) {
        const confirmation = confirm("Are you sure you want to delete this task?");
        if (confirmation) {
            row.remove();
        }
    }

    function editTask(row) {
        const todoTextElement = row.querySelector(".todo-text");
        const newTodoText = prompt("Edit the task:", todoTextElement.textContent);
        if (newTodoText !== null) {
            todoTextElement.textContent = newTodoText;
        }
    }

    function showExpiredTaskModal(row) {
        // Simulated logic for simplicity
        completeTask(row.querySelector("input[type='checkbox']"));
    }
});

function hideOverlay() {
    document.getElementById("completeOverlay").style.display = "none";
}

function showOverlay() {
    document.getElementById("completeOverlay").style.display = "block";
}

function getPriorityColor(priority) {
    switch (priority) {
        case "Low":
            return "lightgreen";
        case "Medium":
            return "lightskyblue";
        case "High":
            return "lightcoral";
        default:
            return "white";
    }
}