const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
	console.log("Preload script executed."); // Check if this appears

	// Inject Bootstrap CSS
	const bootstrapLink = document.createElement("link");
	bootstrapLink.rel = "stylesheet";
	bootstrapLink.href =
		"https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"; // Link to Bootstrap CSS
	document.head.appendChild(bootstrapLink);

	// Create a new div for the progress bar container
	const progressBarContainer = document.createElement("div");
	progressBarContainer.style.display = "none";
	progressBarContainer.style.position = "absolute"; // Use 'absolute' positioning
	progressBarContainer.style.top = "0px"; // Position it lower to avoid covering top content
	progressBarContainer.style.left = "0px"; // Position from the left
	progressBarContainer.style.width = "100%"; // Set width of the progress bar
	progressBarContainer.style.zIndex = "9999"; // High z-index to ensure it appears above other content

	// Create the Bootstrap progress bar
	const progressBar = document.createElement("div");
	progressBar.className = "progress"; // Add Bootstrap progress class
	progressBar.style.height = "5px"; // Set the height of the progress bar

	const progress = document.createElement("div");
	progress.className = "progress-bar"; // Add Bootstrap progress bar class
	progress.style.width = "50%"; // Set initial width (50% for example)

	progress.style.height = "100%"; // Ensure the inner progress bar takes the full height of the container
	progress.setAttribute("role", "progressbar"); // ARIA role for accessibility
	progress.setAttribute("aria-valuenow", "0"); // Set the current progress
	progress.setAttribute("aria-valuemin", "0"); // Minimum value
	progress.setAttribute("aria-valuemax", "100"); // Maximum value

	// Append the progress bar to the container
	progressBar.appendChild(progress);
	progressBarContainer.appendChild(progressBar);

	// Append the progress bar container to the body
	document.body.appendChild(progressBarContainer);

	// Listen for progress updates from main process
	ipcRenderer.on("update-progress", (event, message) => {
		if (message >= 0 && message <= 100) {
			progressBarContainer.style.display = "";
		}
		console.log(message + "--------------------------------------------");

		progress.style.width = `${message}%`; // Update the width of the progress bar
		progress.setAttribute("aria-valuenow", message); // Update ARIA attribute
		if (message >= 100) {
			setTimeout(() => {
				progressBarContainer.style.display = "none";
			}, 1000);
		}
	});
});
