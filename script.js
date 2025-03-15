const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");
const cameraSelect = document.getElementById("cameraSelect");

let currentStream;

async function setupCamera(cameraType) {
    let constraints;
    
    if (cameraType === 'front') {
        constraints = { video: { facingMode: 'user' } }; // Câmera frontal
    } else {
        constraints = { video: { facingMode: { exact: 'environment' } } }; // Câmera traseira
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
}

async function loadModel() {
    overlay.innerText = "Carregando IA...";
    return await cocoSsd.load();
}

async function detectObjects(model) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const predictions = await model.detect(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        ctx.beginPath();
        ctx.rect(...prediction.bbox);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.stroke();
        ctx.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] - 10);
    });

    if (predictions.length > 0) {
        overlay.innerText = `Detectado: ${predictions[0].class}`;
    } else {
        overlay.innerText = "Nenhum objeto detectado.";
    }

    requestAnimationFrame(() => detectObjects(model));
}

async function startAR() {
    const cameraType = cameraSelect.value; // Captura o tipo de câmera selecionado
    menu.style.display = 'none'; // Esconde o menu

    await setupCamera(cameraType); // Configura a câmera escolhida
    const model = await loadModel(); // Carrega o modelo
    detectObjects(model); // Inicia a detecção de objetos
    video.style.display = 'block'; // Exibe o vídeo
    canvas.style.display = 'block'; // Exibe o canvas
}

startButton.addEventListener("click", startAR);
