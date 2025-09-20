let model;
const fileInput = document.getElementById("fileInput");
const uploader = document.getElementById("uploader");
const imgEl = document.getElementById("img");
const preview = document.getElementById("preview");
const results = document.getElementById("results");
const predList = document.getElementById("predList");

// Load MobileNet model
(async function () {
  showMessage("Loading model...");
  model = await mobilenet.load();
  showMessage("Model loaded. Upload an image to classify.");
})();

function showMessage(msg) {
  predList.innerHTML = `<li>${msg}</li>`;
  results.classList.remove("hidden");
}

// Handle file input
fileInput.addEventListener("change", e => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    loadImage(file);
  }
});

// Drag & drop
uploader.addEventListener("dragover", e => {
  e.preventDefault();
  uploader.style.borderColor = "var(--accent)";
});
uploader.addEventListener("dragleave", e => {
  uploader.style.borderColor = "var(--muted)";
});
uploader.addEventListener("drop", e => {
  e.preventDefault();
  uploader.style.borderColor = "var(--muted)";
  if (e.dataTransfer.files.length > 0) {
    loadImage(e.dataTransfer.files[0]);
  }
});

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    imgEl.onload = () => {
      preview.classList.remove("hidden");
      classifyImage();
    };
    imgEl.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function classifyImage() {
  if (!model) {
    showMessage("Model not ready yet...");
    return;
  }

  showMessage("Classifying...");

  try {
    const predictions = await model.classify(imgEl);
    predList.innerHTML = "";

    predictions.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `${p.className} <span>${(p.probability * 100).toFixed(1)}%</span>`;
      predList.appendChild(li);
    });

    results.classList.remove("hidden");
  } catch (err) {
    showMessage("Error during classification: " + err.message);
    console.error(err);
  }
}
