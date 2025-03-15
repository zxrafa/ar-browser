const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const toggleButton = document.getElementById("toggleCamera");

let currentStream;
let currentFacingMode = "environment"; // Inicia com a câmera traseira

// Função para configurar a câmera
async function setupCamera(facingMode) {
    if (currentStream) {
        const tracks = currentStream.getTracks();
        tracks.forEach(track => track.stop()); // Parar a câmera anterior
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } }
    });
    video.srcObject = stream;
    currentStream = stream;
}

// Função para carregar o modelo cocoSsd
async function loadModel() {
    overlay.innerText = "Carregando IA...";
    return await cocoSsd.load();
}

// Função para detectar objetos
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

// Função para alternar entre a câmera frontal e traseira
function toggleCamera() {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment"; // Alterna a câmera
    setupCamera(currentFacingMode); // Configura a nova câmera
}

// Adiciona o evento de clique para o botão
toggleButton.addEventListener("click", toggleCamera);

// Função principal
async function main() {
    await setupCamera(currentFacingMode);
    const model = await loadModel();
    detectObjects(model);
}

main();
