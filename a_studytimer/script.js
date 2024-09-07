// Ensure paused is initialized before usage
let currentMode = 'Study';
let studyTime;
let breakTime;
let timerId = null;
let paused = false;  // Initialized properly
let alertSound = new Audio('alert.wav');
let studyCompleteSound = new Audio('studycomplete.wav');
let breakCompleteSound = new Audio('breakcomplete.wav');
let chessWindow = null;

document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded. Initializing timer...");
    setInitialTimes();  // Initialize times when the page loads
    updateTimer();  // Start the timer
});

function updateTimer() {
    clearTimeout(timerId);
    if (!paused) {
        let time = currentMode === 'Study' ? studyTime : breakTime;
        console.log(`[Timer Update] Mode: ${currentMode}, Time Left: ${time}s`);

        if (time > 0) {
            currentMode === 'Study' ? studyTime-- : breakTime--;
            if (time <= 10 && time > 0) {
                alertSound.play();  // Play alert sound at 10 seconds remaining
            }
        } else {
            endCurrentSession();
        }

        displayTime();
    }
    timerId = setTimeout(updateTimer, 1000);
}

function displayTime() {
    let time = currentMode === 'Study' ? studyTime : breakTime;
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    document.getElementById('timerLabel').textContent = `${currentMode} Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(`[Display Time] ${currentMode} Time: ${minutes}:${seconds}`);
}

function setInitialTimes() {
    let studyInput = prompt("Enter study time in minutes:");
    let breakInput = prompt("Enter break time in minutes:");
    if (studyInput !== null && breakInput !== null) {
        let studyMinutes = parseInt(studyInput);
        let breakMinutes = parseInt(breakInput);
        if (!isNaN(studyMinutes) && studyMinutes > 0 && !isNaN(breakMinutes) && breakMinutes > 0) {
            studyTime = studyMinutes * 60;
            breakTime = breakMinutes * 60;
            console.log(`Times set by user - Study: ${studyMinutes} minutes, Break: ${breakMinutes} minutes`);
        } else {
            alert("Please enter valid numbers for both study and break times.");
        }
    }
    displayTime();
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: body });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: body });
            }
        });
    }
}

function endCurrentSession() {
    if (currentMode === 'Study') {
        studyCompleteSound.play();
        console.log(`[Session End] Study session ended. Switching to break.`);
        currentMode = 'Break';

        // // Offer to play chess
        // let playChess = confirm("You're on break! Would you like to play chess on chess.com?");
        // if (playChess) {
        //     openChess();
        // }
    } else {
        breakCompleteSound.play();
        console.log(`[Session End] Break session ended.`);

        // Prevent duplicate messages
        let existingMessage = document.getElementById('extendMessage');
        if (!existingMessage) {
            // Show a notification when break time ends
            showNotification("Break Over!", "Would you like to extend your break? Come back to the page to decide.");

            // Show an on-screen message with a button to extend break when the user returns
            let messageDiv = document.createElement('div');
            messageDiv.id = 'extendMessage';
            messageDiv.innerHTML = `
                <div style="padding: 20px; background-color: yellow; text-align: center;">
                    <p>Break time is over. Would you like to extend your break by 3 more minutes in exchange for 10 more minutes of study?</p>
                    <button onclick="extendBreak()">Yes, extend break</button>
                    <button onclick="dismissMessage()">No, continue studying</button>
                </div>
            `;
            document.body.appendChild(messageDiv);
        }
    }

    // Stop updating the timer until the user responds to the message
    clearTimeout(timerId);
}

function extendBreak() {
    breakTime += 180;  // Add 3 minutes to break
    studyTime += 600;  // Add 10 minutes to study
    console.log("Break extended by 3 minutes, study time extended by 10 minutes.");
    dismissMessage();  // Remove the message from the screen
    currentMode = 'Study';  // Switch back to study mode after extending the break
    updateTimer();  // Restart the timer
}

function dismissMessage() {
    let messageDiv = document.getElementById('extendMessage');
    if (messageDiv) {
        messageDiv.remove();  // Remove the message element from the DOM
    }
    currentMode = 'Study';  // Switch to study mode after dismissing the message
    updateTimer();  // Restart the timer
}

function resetIntervalTimes() {
    console.log(`[Reset Intervals] New Study Time: ${studyTime}s, New Break Time: ${breakTime}s`);
}

function switchMode() {
    clearTimeout(timerId);

    // Get the increment values from the input fields (study in minutes, break in seconds)
    let studyIncrement = parseInt(document.getElementById('studyIncrement').value) * 60; // Convert to seconds
    let breakIncrement = parseInt(document.getElementById('breakIncrement').value); // Already in seconds

    // Switch between Study and Break modes
    if (currentMode === 'Study') {
        currentMode = 'Break';
        breakTime += breakIncrement;  // Increment the break time

        // // Prompt the user to play chess when switching to Break mode 
        // let playChess = confirm("You're on break! Would you like to play chess on chess.com?");
        // if (playChess) {
        //     openChess();  // Open chess.com in a new window
        //}

    } else {
        currentMode = 'Study';
        studyTime += studyIncrement;  // Increment the study time
    }

    console.log(`[Switch Mode] Switched to ${currentMode}. Study Increment: ${studyIncrement / 60} min, Break Increment: ${breakIncrement} sec`);

    updateTimer();  // Restart the timer with the updated times
}

// function openChess() {
//     chessWindow = window.open("https://www.chess.com/play/online", "Chess Game", "width=800,height=600");
//     console.log("Chess game opened.");
//     chessWindow.onbeforeunload = function() {
//         extendBreakAfterChess();
//     };
// }

function extendBreakAfterChess() {
    // After chess game ends, prompt the user to extend break
    if (confirm("Would you like to extend your break by 3 more minutes and add 10 minutes to study?")) {
        breakTime += 180;  // Add 3 minutes (180 seconds) to break
        studyTime += 600;  // Add 10 minutes (600 seconds) to study
        console.log("Break extended by 3 minutes, study time extended by 10 minutes.");
    }
    currentMode = 'Study';  // Return to study mode after break extension
    updateTimer();  // Restart the timer with updated times
}

function resetTimer() {
    clearTimeout(timerId);
    studyTime = 0;
    breakTime = 0;
    paused = true;
    document.getElementById('pauseButton').textContent = 'Resume';
    console.log("Timer reset.");
    closeChessGame();
    displayTime();
}

function closeChessGame() {
    if (chessWindow) {
        chessWindow.close();
        console.log("Chess game closed.");
    }
}

function togglePause() {
    console.log('Toggling pause, current state:', paused);  // Log the current state before toggling
    paused = !paused;
    document.getElementById('pauseButton').textContent = paused ? 'Resume' : 'Pause';
    if (!paused) {
        updateTimer();
    }
}

function uploadBackground() {
    const fileInput = document.getElementById('backgroundUploader');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            document.body.style.backgroundSize = "cover";
            console.log("Background updated.");
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function openBackgroundLibrary() {
    const library = document.getElementById('backgroundLibrary');
    library.style.display = library.style.display === 'none' ? 'block' : 'none';
    console.log("Background library toggled.");
}

function applyGradient() {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    document.body.style.backgroundImage = `linear-gradient(${color1}, ${color2})`;
    document.body.style.backgroundSize = "cover";
    console.log("Gradient background applied.");
}

// function setPresetBackground() { 
//     document.body.style.backgroundImage = 'url("MuslimMoon.png")';
//     document.body.style.backgroundSize = "cover";
//     console.log("Preset background set.");
// }
