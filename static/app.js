const form = document.querySelector("#upload-form");
const fileInput = document.querySelector("#file-input");
const dropzone = document.querySelector("#dropzone");
const progress = document.querySelector("#upload-progress");
const progressBar = document.querySelector("#progress-bar");
const progressPercent = document.querySelector("#progress-percent");
const progressName = document.querySelector("#progress-name");
const progressLabel = document.querySelector("#progress-label");
const cancelButton = document.querySelector("#cancel-upload");
const analysisCard = document.querySelector("#analysis-card");
const architectureCard = document.querySelector("#architecture-card");
const toast = document.querySelector("#error-toast");
const xhr = new XMLHttpRequest();
let currentSessionId = null;
let deploymentEvents = null;
let deploymentStatus = "uploaded";
let lastEventSequence = 0;

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const showError = (message) => {
  document.querySelector("#error-message").textContent = message;
  toast.hidden = false;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The request could not be completed.");
  return body;
};

const resetUploader = () => {
  xhr.abort();
  form.reset();
  progress.hidden = true;
  dropzone.hidden = false;
  progressBar.style.width = "0";
};

const setStep = (step) => {
  document.querySelectorAll(".steps li").forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle("active", itemStep === step);
    item.classList.toggle("complete", itemStep < step);
    item.querySelector(".step-number").textContent = itemStep < step
      ? "✓"
      : String(itemStep).padStart(2, "0");
  });
};

const renderAnalysis = (result) => {
  currentSessionId = result.id;
  lastEventSequence = 0;
  document.querySelector("#analysis-filename").textContent = result.filename;
  document.querySelector("#analysis-stack").textContent = result.primaryStack;
  document.querySelector("#analysis-size").textContent = formatBytes(result.unpackedBytes);
  document.querySelector("#analysis-files").textContent = `${result.fileCount.toLocaleString()} files inspected`;

  const tagContainer = document.querySelector("#analysis-tags");
  tagContainer.replaceChildren();
  (result.detected.length ? result.detected : ["Custom build"]).forEach((tag) => {
    const element = document.createElement("span");
    element.textContent = tag;
    tagContainer.append(element);
  });

  const languages = document.querySelector("#analysis-languages");
  languages.replaceChildren();
  if (!result.languages.length) {
    languages.textContent = "No source languages detected";
  } else {
    result.languages.forEach((language) => {
      const row = document.createElement("div");
      row.className = "language-row";
      const name = document.createElement("span");
      name.textContent = language.name;
      const bar = document.createElement("i");
      bar.style.setProperty("--width", `${language.percent}%`);
      const percent = document.createElement("span");
      percent.textContent = `${language.percent}%`;
      row.append(name, bar, percent);
      languages.append(row);
    });
  }

  document.querySelector("#upload-card").hidden = true;
  analysisCard.hidden = false;
  analysisCard.scrollIntoView({ behavior: "smooth", block: "center" });
};

const updateRunStatus = (snapshot) => {
  deploymentStatus = snapshot.status;
  const status = document.querySelector("#run-status");
  status.className = `run-status ${snapshot.status}`;
  status.querySelector("span").textContent = snapshot.status;
  const running = snapshot.status === "running";
  document.querySelector("#terminal-input").disabled = !running;
  document.querySelector("#terminal-input-form button").disabled = !running;
  document.querySelector("#stop-deployment").disabled = !running;
  document.querySelector("#retry-deployment").hidden = running
    || !["completed", "failed", "stopped"].includes(snapshot.status);

  if (snapshot.status === "completed") {
    setStep(3);
    document.querySelector("#console-hint").innerHTML = "<strong>Complete:</strong> The managed workflow exited successfully.";
  } else if (snapshot.status === "failed") {
    document.querySelector("#console-hint").innerHTML = `<strong>Stopped:</strong> The workflow exited with code ${snapshot.returnCode ?? "unknown"}. Review the output and run it again.`;
  } else if (snapshot.status === "stopped") {
    document.querySelector("#console-hint").innerHTML = "<strong>Stopped:</strong> You can run the workflow again with the same uploaded project.";
  }
};

const connectDeploymentEvents = (after = 0) => {
  if (deploymentEvents) deploymentEvents.close();
  deploymentEvents = new EventSource(`/api/projects/${currentSessionId}/events?after=${after}`);
  const output = document.querySelector("#deployment-output");

  deploymentEvents.addEventListener("output", (event) => {
    const payload = JSON.parse(event.data);
    lastEventSequence = Math.max(lastEventSequence, Number(event.lastEventId) || 0);
    const nearBottom = output.scrollHeight - output.scrollTop - output.clientHeight < 80;
    output.textContent += payload.text;
    if (payload.text.includes("Phase 2: Senior DevOps")) setStep(3);
    if (nearBottom) output.scrollTop = output.scrollHeight;
  });
  deploymentEvents.addEventListener("status", (event) => {
    updateRunStatus(JSON.parse(event.data));
  });
  deploymentEvents.addEventListener("complete", (event) => {
    updateRunStatus(JSON.parse(event.data));
    deploymentEvents.close();
  });
  deploymentEvents.onerror = () => {
    if (deploymentStatus === "running") {
      document.querySelector("#console-hint").innerHTML = "<strong>Reconnecting:</strong> The output stream was interrupted; the agent is still running.";
    }
  };
};

const startDeployment = async () => {
  if (!currentSessionId) {
    showError("Upload and analyze an application first.");
    return;
  }
  architectureCard.hidden = false;
  architectureCard.scrollIntoView({ behavior: "smooth", block: "center" });
  document.querySelector("#deployment-output").textContent = "";
  const streamAfter = lastEventSequence;
  document.querySelector("#continue-button").disabled = true;
  document.querySelector("#console-hint").innerHTML = "<strong>Tip:</strong> Your uploaded project path is sent automatically at the first prompt.";
  setStep(2);
  try {
    const snapshot = await requestJson(`/api/projects/${currentSessionId}/start`, { method: "POST" });
    updateRunStatus(snapshot);
    connectDeploymentEvents(streamAfter);
  } catch (error) {
    showError(error.message);
    document.querySelector("#continue-button").disabled = false;
  }
};

const upload = (file) => {
  const allowed = /\.(zip|tar\.gz|tgz)$/i;
  if (!allowed.test(file.name)) {
    showError("Choose a ZIP, TAR.GZ, or TGZ application archive.");
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    showError("The archive must be 50 MB or smaller.");
    return;
  }

  progressName.textContent = file.name;
  progress.hidden = false;
  dropzone.hidden = true;
  progressLabel.textContent = "Uploading securely…";
  const body = new FormData();
  body.append("application", file);

  xhr.open("POST", "/api/projects/analyze");
  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable) return;
    const percent = Math.round((event.loaded / event.total) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    if (percent === 100) progressLabel.textContent = "Inspecting project structure…";
  };
  xhr.onerror = () => {
    resetUploader();
    showError("The upload could not be completed. Check your connection and try again.");
  };
  xhr.onload = () => {
    let result;
    try {
      result = JSON.parse(xhr.responseText);
    } catch {
      result = { error: "The server returned an unexpected response." };
    }
    if (xhr.status < 200 || xhr.status >= 300) {
      resetUploader();
      showError(result.error || "The archive could not be analyzed.");
      return;
    }
    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";
    renderAnalysis(result);
  };
  xhr.send(body);
};

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) upload(fileInput.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
});

dropzone.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files[0];
  if (file) upload(file);
});

dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

cancelButton.addEventListener("click", resetUploader);
toast.querySelector("button").addEventListener("click", () => { toast.hidden = true; });

document.querySelector("#replace-file").addEventListener("click", async () => {
  if (deploymentStatus === "running" && currentSessionId) {
    try {
      await requestJson(`/api/projects/${currentSessionId}/stop`, { method: "POST" });
    } catch {
      // The process may have already exited between the click and this request.
    }
  }
  if (deploymentEvents) deploymentEvents.close();
  currentSessionId = null;
  deploymentStatus = "uploaded";
  lastEventSequence = 0;
  analysisCard.hidden = true;
  architectureCard.hidden = true;
  document.querySelector("#upload-card").hidden = false;
  document.querySelector("#continue-button").disabled = false;
  resetUploader();
  setStep(1);
});

document.querySelector("#continue-button").addEventListener("click", startDeployment);
document.querySelector("#retry-deployment").addEventListener("click", startDeployment);

document.querySelector("#terminal-input-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#terminal-input");
  const value = input.value.trim();
  if (!value) return;
  input.disabled = true;
  try {
    await requestJson(`/api/projects/${currentSessionId}/input`, {
      method: "POST",
      body: JSON.stringify({ value }),
    });
    input.value = "";
  } catch (error) {
    showError(error.message);
  } finally {
    input.disabled = deploymentStatus !== "running";
    if (!input.disabled) input.focus();
  }
});

document.querySelector("#stop-deployment").addEventListener("click", async () => {
  try {
    const snapshot = await requestJson(`/api/projects/${currentSessionId}/stop`, { method: "POST" });
    updateRunStatus(snapshot);
  } catch (error) {
    showError(error.message);
  }
});

document.querySelector("#clear-output").addEventListener("click", () => {
  document.querySelector("#deployment-output").textContent = "";
});
