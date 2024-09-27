"use strict";
function audioInitialize() {
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        return { audioCtx, analyser };
    });
}
function drawFrequencyLine(canvasCtx, lineHistory, canvasHeight) {
    canvasCtx.beginPath();
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
    canvasCtx.moveTo(0, canvasHeight - (lineHistory[0] / 1000 * canvasHeight));
    for (let i = 1; i < lineHistory.length; i++) {
        const y = canvasHeight - (lineHistory[i] / 1000 * canvasHeight);
        canvasCtx.lineTo(i, y);
    }
    canvasCtx.stroke();
}
audioInitialize().then(({ audioCtx, analyser }) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let lastValidFrequency = 0;
    const canvas = document.getElementById('audioCanvas');
    if (canvas == null) {
        console.error("Canvas recebeu null");
    }
    else {
        const canvasCtx = canvas.getContext('2d');
        let lineHistory = [];
        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            const sampleRate = audioCtx.sampleRate;
            let maxIndexByteFrequency = 0;
            for (let i = 1; i < bufferLength; i++) {
                if (dataArray[i] > dataArray[maxIndexByteFrequency]) {
                    maxIndexByteFrequency = i;
                }
            }
            const frequencyInHz = maxIndexByteFrequency * (sampleRate / 2) / bufferLength;
            const validThreshold = 500;
            if (Math.abs(frequencyInHz - lastValidFrequency) < validThreshold) {
                lineHistory.push(frequencyInHz);
                lastValidFrequency = frequencyInHz;
            }
            if (lineHistory.length > canvas.width) {
                lineHistory.shift();
            }
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            drawFrequencyLine(canvasCtx, lineHistory, canvas.height);
            canvasCtx.fillStyle = 'rgb(255, 255, 255)';
            canvasCtx.font = '20px Arial';
            canvasCtx.fillText(`Frequência: ${Math.round(frequencyInHz)} Hz`, 10, 30);
        }
        draw();
    }
})
    .catch(function (err) {
    console.error("Falha ao Acessar o Microfone");
});
