// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    nextId = JSON.parse(localStorage.getItem("nextId"));
    localStorage.setItem('nextId', JSON.stringify(nextId+1));
    return nextId+1;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    var taskContainer;
    if (task.status == 'to-do') {
        taskContainer=document.getElementById('todo-cards')
    } else if (task.status == 'in-progress') {
        taskContainer=document.getElementById('in-progress-cards')
    } else if (task.status == 'done') {
        taskContainer=document.getElementById('done-cards')
    }

    let card = document.createElement('div');
    card.style.zIndex = 3;
    card.setAttribute('task-id', task.taskId)

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body px-0 pt-0';

    let title = document.createElement('h5');
    title.innerText = task.title;
    title.className = 'new-card-title border-bottom border-dark py-1 bg-gradient-secondary';

    let description = document.createElement('div');
    description.innerText = task.description;
    description.className = 'card-description';

    let date = document.createElement('div');
    date.innerText = task.dueDate;
    date.className = 'card-date';

    let deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.className = 'delete-button btn btn-danger border-dark';

    daysUntilDue = dayjs().diff(dayjs(task.dueDate), 'day')
    if (task.status == "to-do" || task.status == "in-progress") {
        if (daysUntilDue > 0) {
            card.className = 'card shadow task-card draggable bg-danger text-white mb-1 pt-0';
        } else if (daysUntilDue > -1 && daysUntilDue <= 0) {
            card.className = 'card shadow task-card draggable bg-warning text-white mb-1 pt-0'
        } else {
            card.className = 'card shadow task-card draggable bg-white text-dark mb-1 pt-0'
        }
    } else {
        card.className = 'card shadow task-card draggable bg-white text-dark mb-1 pt-0'
    }

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(date);
    cardBody.appendChild(deleteButton)
    card.appendChild(cardBody);
    taskContainer.appendChild(card);
    // Update the draggable initialization to set z-index on start
    $(".draggable").draggable({
        helper: 'clone',
        appendTo: 'body', // Append the helper to the body
        start: function(event, ui) {
            // Set width and height to match the original card's dimensions
            ui.helper.width($(this).width());
            ui.helper.height($(this).height());
            // Set a high z-index value
            ui.helper.css('z-index', 1000);
            // Center-align text within the helper
            ui.helper.find('.card-body').css('text-align', 'center');
        },
        stop: function(event, ui) {
            // Remove the helper from the DOM after drag stops
            $(ui.helper).remove();
        }
    })
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty()
    // Use JSON.parse() to convert text to JavaScript object
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    // Check if data is returned, if not exit out of the function
    if (tasks !== null) {
        for (const task of tasks) {
        createTaskCard(task)
        }
    }
}

// handle adding a new task
function handleAddTask(event){
    
    const newTask = {
        title: $('#task-title').val().trim(),
        dueDate: $('#datepicker').val().trim(),
        description: $('#task-description').val().trim(),
        status: "to-do",
        taskId: generateTaskId()
    };
    $('#task-title').val('');
    $('#datepicker').val('');
    $('#task-description').val('');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(newTask);

    // Use .setItem() to store array object in storage and JSON.stringify to convert it to a string
    localStorage.setItem('tasks', JSON.stringify(tasks));
    createTaskCard(newTask);
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const id = event.target.parentElement.parentElement.getAttribute('task-id');

    // Delete the card element
    event.target.parentElement.parentElement.remove();

    // Delete the element from the local storage array
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks !== null) {
        index = -1;
      for (i = 0; i < tasks.length; i++) {
        task = tasks[i];
        if (task.taskId == id) {
            index = i;
            break;
        }
      }
      if (index != -1) {
        tasks.splice(index, 1);
      }
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    event.preventDefault();
    const id = ui.draggable[0].getAttribute('task-id');

    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks !== null) {
        index = -1;
      for (i = 0; i < tasks.length; i++) {
        task = tasks[i];
        if (task.taskId == id) {
            task.status = event.target.id;
        }
      }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    $("#datepicker").datepicker();

    renderTaskList();

    $(".lane").droppable({accept: ".draggable", drop: handleDrop});

    $(".card-body").on('click', ".delete-button", handleDeleteTask);
    // listen for add-task submission
    $('#add-task').click(handleAddTask);

    // Function to clear the input fields
    function clearFormFields() {
        $('#task-title').val(''); // Clear task title field
        $('#datepicker').val(''); // Clear due date field
        $('#task-description').val(''); // Clear task description field
    }

    // Listen for the modal's close event
    $('#formModal').on('hidden.bs.modal', function () {
        clearFormFields(); // Call the function to clear the input fields
    });
});
