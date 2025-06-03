const URL = "./model/";
let model, webcam, labelContainer, maxPredictions;
let isPaused = false;
let webcamCanvasId = "webcam-canvas";

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  if (!model) {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
  }

  const oldCanvas = document.getElementById(webcamCanvasId);
  if (oldCanvas) oldCanvas.remove();

  webcam = new tmImage.Webcam(224, 224, true);
  await webcam.setup();
  await webcam.play();
  isPaused = false;
  window.requestAnimationFrame(loop);

  const container = document.getElementById("webcam-container");
  container.innerHTML = ""; 
  const canvas = webcam.canvas;
  canvas.setAttribute("id", webcamCanvasId);
  container.appendChild(canvas);

  
  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  labelContainer.appendChild(document.createElement("div"));
}


async function loop() {
  if (!isPaused && webcam) {
    webcam.update();
    await predict();
  }
  window.requestAnimationFrame(loop);
}


async function predict() {
  const prediction = await model.predict(webcam.canvas);
  const top = prediction.reduce((a, b) => a.probability > b.probability ? a : b);
  labelContainer.childNodes[0].innerHTML = `Detectado: <strong>${top.className}</strong> (${(top.probability * 100).toFixed(2)}%)`;
}


function pauseWebcam() {
  if (webcam) {
    webcam.stop();
    isPaused = true;
    labelContainer.childNodes[0].innerHTML = "Cámara pausada.";
  }
}



async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const img = document.getElementById('input-image');
    img.src = e.target.result;
    img.onload = async () => {
      if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
      }

      const prediction = await model.predict(img);
      const top = prediction.reduce((a, b) => a.probability > b.probability ? a : b);
      document.getElementById("image-result").innerHTML = `Objeto detectado: <strong>${top.className}</strong> (${(top.probability * 100).toFixed(2)}%)`;
    };
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
}
