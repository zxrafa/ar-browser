const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
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

async function main() {
    await setupCamera();
    const model = await loadModel();
    detectObjects(model);
}

main();
