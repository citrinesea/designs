document.addEventListener("DOMContentLoaded", function () {
    const setReminderBtn = document.getElementById('set-reminder');
    const reminderInput = document.getElementById('reminder-input');
    const reminderTime = document.getElementById('reminder-time');
    const reminderDisplay = document.getElementById('reminder-display');
    const remindersList = document.getElementById('reminders-list');
    const confirmationMessage = document.getElementById('confirmation-message');
    const animeBoyImg = document.getElementById('anime-boy-img');
    const completeReminderBtn = document.getElementById('complete-reminder-btn');
    const clearTodoBtn = document.getElementById('clear-todo-btn');

    // Function to get reminders from localStorage
    function getReminders() {
        const reminders = localStorage.getItem('reminders');
        return reminders ? JSON.parse(reminders) : [];
    }

    // Function to save reminders to localStorage
    function saveReminders(reminders) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }

    // Initialize reminders array from localStorage
    let reminders = getReminders();

    // Function to convert 24-hour time to 12-hour time (AM/PM)
    function formatTimeTo12Hour(time) {
        const [hours, minutes] = time.split(':');
        let hoursInt = parseInt(hours);
        const ampm = hoursInt >= 12 ? 'PM' : 'AM';
        hoursInt = hoursInt % 12;
        hoursInt = hoursInt ? hoursInt : 12; // the hour '0' should be '12'
        return `${hoursInt}:${minutes} ${ampm}`;
    }

    // Check if it's a new day and reset reminders
    function checkForNewDay() {
        const now = new Date();
        const lastResetDate = localStorage.getItem('lastResetDate');
        const currentDate = now.toDateString();
        if (lastResetDate !== currentDate) {
            // If the date has changed, reset reminders
            localStorage.setItem('lastResetDate', currentDate);
            reminders = []; // Clear reminders array
            saveReminders(reminders); // Save empty array to localStorage
            updateRemindersList();
            updateReminderDisplay();
            updateAnimeBoyImage(); // Reset the image
        }
    }

    // Update anime boy image based on reminders status
    function updateAnimeBoyImage() {
        // Set the default image to "no reminder" on refresh
        animeBoyImg.src = "img/anime-boy-no-reminder.png";

        if (reminders.some(reminder => !reminder.completed)) {
            animeBoyImg.src = "img/test-keito.png";
            completeReminderBtn.style.display = 'inline-block'; // Show the confirmation button when a reminder is active
        } else if (reminders.every(reminder => reminder.completed)) {
            animeBoyImg.src = "img/anime-boy-post-reminder.png";
            completeReminderBtn.style.display = 'none'; // Hide the confirmation button once all reminders are completed
        }
    }

    setReminderBtn.addEventListener('click', function () {
        const reminderText = reminderInput.value;
        const reminderTimeValue = reminderTime.value;

        if (reminderText && reminderTimeValue) {
            const now = new Date();
            const [hours, minutes] = reminderTimeValue.split(':');
            const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

            const timeUntilReminder = reminderDate - now;

            if (timeUntilReminder > 0) {
                setTimeout(() => {
                    alert(`Reminder: ${reminderText}`);
                    markReminderAsCompleted(reminderText, reminderTimeValue);
                }, timeUntilReminder);

                // Format the time to 12-hour format (AM/PM)
                const formattedTime = formatTimeTo12Hour(reminderTimeValue);

                // Show confirmation message
                confirmationMessage.style.display = 'block';
                setTimeout(() => {
                    confirmationMessage.style.display = 'none';
                }, 3000);

                // Add new reminder to the array
                reminders.push({ text: reminderText, time: reminderDate, formattedTime: formattedTime, completed: false });

                // Sort the reminders in chronological order by time
                reminders.sort((a, b) => a.time - b.time);

                // Save reminders to localStorage
                saveReminders(reminders);

                // Update the reminders list
                updateRemindersList();

                // Update the display with the first reminder
                updateReminderDisplay();

                // Update the anime boy image based on the current reminder status
                updateAnimeBoyImage();
            } else {
                alert('Please select a time in the future.');
            }
        } else {
            alert('Please fill in both the reminder and time.');
        }
    });

    // Function to update the reminders list
    function updateRemindersList() {
        remindersList.innerHTML = ''; // Clear list
    
        reminders.forEach((reminder, index) => {
            const reminderItem = document.createElement('div');
            reminderItem.classList.add('reminder-item');
    
            // Ensure completed reminders are visually marked
            reminderItem.innerHTML = 
                `<span class="reminder-text" style="color: ${reminder.completed ? 'grey' : 'black'}; 
                      text-decoration: ${reminder.completed ? 'line-through' : 'none'};">
                    ${reminder.text} at ${reminder.formattedTime}
                </span>
                <button class="complete-button" onclick="markReminderAsCompleted('${reminder.text}', '${reminder.formattedTime}')"><img src="img/lotus.png" alt="Complete" class="lotus-icon"></button>
                <button class="delete-button" onclick="cancelReminder(${index})">&times;</button>`;
    
            remindersList.appendChild(reminderItem);
        });
    }

    // Function to update the display with the first uncompleted reminder
    function updateReminderDisplay() {
        const nextReminder = reminders.find(reminder => !reminder.completed);

        if (nextReminder) {
            reminderDisplay.innerHTML = `Hey, did you remember to <span style="font-weight: bold; color:  rgb(74, 147, 1);">${nextReminder.text}</span>? It's <span style="font-weight: bold; color: rgb(74, 147, 1);">${nextReminder.formattedTime}</span>, so I'm reminding you to get it done, okay?`;
        } else {
            reminderDisplay.innerHTML = `<span style="font-weight: bold; color: green;">Wonderful job</span>. You got everything done on your list. Is there anything left for you to do today?`;
        }
    }

    window.markReminderAsCompleted = function (text, time) {
        console.log("Marking as completed:", text, time); // Debug log
    
        const reminderIndex = reminders.findIndex(reminder => reminder.text === text && reminder.formattedTime === time);
    
        if (reminderIndex !== -1) {
            reminders[reminderIndex].completed = true; // Mark only the specific reminder as completed
            console.log("Reminder found and updated:", reminders[reminderIndex]); // Confirm update
    
            saveReminders(reminders); // Save updates
            updateRemindersList();
            updateReminderDisplay();
            updateAnimeBoyImage();
        } else {
            console.error("Reminder not found:", text, time, reminders);
        }
    };
    

    // Function to confirm the task (mark all active reminders as completed)
    completeReminderBtn.addEventListener('click', function () {
        reminders.forEach(reminder => {
            if (!reminder.completed) {
                reminder.completed = true; // Mark the reminder as completed
            }
        });

        saveReminders(reminders); // Save the updated list to localStorage
        updateRemindersList(); // Re-render the reminders list
        updateReminderDisplay(); // Update the displayed reminder to the next uncompleted one

        // Update the anime boy image if all reminders are completed
        updateAnimeBoyImage();
    });

    // Function to cancel a reminder
    window.cancelReminder = function (index) {
        reminders.splice(index, 1); // Remove the reminder from the array
        saveReminders(reminders); // Save the updated list to localStorage
        updateRemindersList(); // Re-render the reminders list
        updateReminderDisplay(); // Update the displayed reminder to the next uncompleted one

        // Update the anime boy image if there are no reminders
        updateAnimeBoyImage();
    }

    // Function to clear the todo list
    function clearTodoList() {
        // Clear the reminders array and save it to localStorage
        reminders = [];
        saveReminders(reminders);

        // Update the UI (empty the reminders list)
        updateRemindersList();
        updateReminderDisplay();
        updateAnimeBoyImage(); // Update the anime boy image to reflect the cleared list
    }

    // Attach the clearTodoList function to the button
    if (clearTodoBtn) {
        clearTodoBtn.addEventListener('click', clearTodoList);
    }

    // Initially load and display reminders from localStorage
    checkForNewDay(); // Check if it's a new day and reset reminders if necessary
    updateRemindersList();
    updateReminderDisplay();
    updateAnimeBoyImage(); // Ensure the default image is displayed
});
