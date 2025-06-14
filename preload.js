const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
	console.log("Preload script executed.");

	// === Inject Bootstrap ===
	const bootstrapLink = document.createElement("link");
	bootstrapLink.rel = "stylesheet";
	bootstrapLink.href =
		"https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css";
	document.head.appendChild(bootstrapLink);

	// === Progress Bar Setup ===
	const progressBarContainer = document.createElement("div");
	progressBarContainer.style.display = "none";
	progressBarContainer.style.position = "fixed";
	progressBarContainer.style.top = "0";
	progressBarContainer.style.left = "0";
	progressBarContainer.style.width = "100%";
	progressBarContainer.style.zIndex = "9999";

	const progressBar = document.createElement("div");
	progressBar.className = "progress";
	progressBar.style.height = "5px";
	progressBar.style.margin = "0";

	const progress = document.createElement("div");
	progress.className = "progress-bar bg-success";
	progress.style.width = "0%";
	progress.style.height = "100%";
	progress.setAttribute("role", "progressbar");
	progress.setAttribute("aria-valuenow", "0");
	progress.setAttribute("aria-valuemin", "0");
	progress.setAttribute("aria-valuemax", "100");

	progressBar.appendChild(progress);
	progressBarContainer.appendChild(progressBar);
	document.body.appendChild(progressBarContainer);

	// === Update Dialog UI ===
	let updateDialog = null;

	function showUpdateDialog(
		version,
		message,
		confirmCallback,
		cancelCallback
	) {
		if (updateDialog) return;

		updateDialog = document.createElement("div");
		updateDialog.className = "alert alert-info text-right";
		updateDialog.style.position = "fixed";
		updateDialog.style.bottom = "20px";
		updateDialog.style.right = "20px";
		updateDialog.style.zIndex = "10000";
		updateDialog.style.width = "300px";
		updateDialog.innerHTML = `
			<h5>${message.title}</h5>
			<p>${message.body}</p>
			<div class="d-flex justify-content-end mt-2">
				<button id="update-confirm" class="btn btn-sm btn-success ml-2">${message.confirmText}</button>
				<button id="update-cancel" class="btn btn-sm btn-secondary">${message.cancelText}</button>
			</div>
		`;

		document.body.appendChild(updateDialog);

		document.getElementById("update-confirm").onclick = () => {
			confirmCallback();
			updateDialog.remove();
			updateDialog = null;
		};

		document.getElementById("update-cancel").onclick = () => {
			if (cancelCallback) cancelCallback();
			updateDialog.remove();
			updateDialog = null;
		};
	}

	// === IPC Listeners ===

	// New update available — ask user if they want to download it
	ipcRenderer.on("update-available", (_event, version) => {
		showUpdateDialog(
			version,
			{
				title: `نسخه جدید (${version}) در دسترس است`,
				body: "آیا می‌خواهید به‌روزرسانی را اکنون دانلود کنید؟",
				confirmText: "دانلود",
				cancelText: "بعداً",
			},
			() => {
				ipcRenderer.send("start-update");
			}
		);
	});

	// Download progress
	ipcRenderer.on("update-progress", (_event, percent) => {
		progressBarContainer.style.display = "block";
		progress.style.width = `${percent}%`;
		progress.setAttribute("aria-valuenow", percent.toString());

		if (percent >= 100) {
			setTimeout(() => {
				progressBarContainer.style.display = "none";
			}, 1500);
		}
	});

	// Update downloaded — ask user if they want to install now
	ipcRenderer.on("update-downloaded", () => {
		showUpdateDialog(
			null,
			{
				title: "به‌روزرسانی دانلود شد",
				body: "آیا می‌خواهید هم‌اکنون نصب و برنامه را راه‌اندازی مجدد کنید؟",
				confirmText: "نصب و راه‌اندازی مجدد",
				cancelText: "بعداً",
			},
			() => {
				ipcRenderer.send("install-update");
			}
		);
	});

	// Update error
	ipcRenderer.on("update-error", (_event, message) => {
		alert("خطا در به‌روزرسانی: " + message);
	});
});
