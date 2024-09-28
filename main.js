"use strict";
//LoadingMP3
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
(_a = document.getElementById('playAudio')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
    var _a;
    (_a = document.getElementById('mp3Input')) === null || _a === void 0 ? void 0 : _a.click();
});
(_b = document.getElementById('mp3Input')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', function (event) {
    const input = event.target;
    console.log("Arquivo Selecionado");
    if ((input === null || input === void 0 ? void 0 : input.files) && input.files[0]) {
        console.log("Processando MP3");
        const file = input.files[0];
        loadAndProcessMP3(file);
    }
    else {
        console.error("Nenhum arquivo selecionado.");
    }
});
function loadAndProcessMP3(file) {
    const audioMp3Context = new AudioContext();
    if (audioMp3Context.state === 'suspended') {
        audioMp3Context.resume();
    }
    const mp3Reader = new FileReader();
    mp3Reader.onload = function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = event.target) === null || _a === void 0 ? void 0 : _a.result) {
                const arrayBuffer = event.target.result;
                const audioBuffer = yield audioMp3Context.decodeAudioData(arrayBuffer);
                const { audioBuffer: AudioBuffer, audioContext, analyser } = processMP3AudioBuffer(audioBuffer, audioMp3Context);
                updateCanvasWithMp3(AudioBuffer, audioContext, analyser);
            }
            else {
                console.error("Houve um erro ao carregar o arquivo");
            }
        });
    };
    mp3Reader.readAsArrayBuffer(file);
}
function updateCanvasWithMp3(audioBuffer, audioContext, analyser) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    function update() {
        analyser.getByteFrequencyData(dataArray);
        const sampleRate = audioContext.sampleRate;
        let maxIndexByteFrequency = 0;
        for (let i = 1; i < bufferLength; i++) {
            if (dataArray[i] > dataArray[maxIndexByteFrequency]) {
                maxIndexByteFrequency = i;
            }
        }
        const frequencyInHz = maxIndexByteFrequency * (sampleRate / 2) / bufferLength;
        console.log("MP3 Frequência em Hz:", frequencyInHz);
        drawCanvas(frequencyInHz, null);
        requestAnimationFrame(update);
    }
    update();
}
function processMP3AudioBuffer(audioBuffer, audioContext) {
    console.log("Processando Buffer do MP3 Audio");
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.start();
    return { audioBuffer, audioContext, analyser };
}
//Loading Mic Audio
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
//AudioProcessing
function frequencyToPosition(frequency, canvasHeight, minFrequency, maxFrequency) {
    if (frequency <= 0)
        return canvasHeight;
    const logMinFreq = Math.log10(minFrequency);
    const logMaxFreq = Math.log10(maxFrequency);
    const logFreq = Math.log10(frequency);
    const positionRatio = (logFreq - logMinFreq) / (logMaxFreq - logMinFreq);
    return canvasHeight * (1 - positionRatio);
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
function noteToFrequency(note, noteRange, minFrequency, maxFrequency) {
    const noteIndex = noteRange.indexOf(note);
    if (noteIndex === -1)
        throw new Error("Nota Inválida");
    const frequency = minFrequency * Math.pow(maxFrequency / minFrequency, noteIndex / (noteRange.length - 1));
    return frequency;
}
function drawFrequencyPoint(canvasCtx, frequencyInHz, canvasHeight, minFrequency, maxFrequency, color) {
    if (!frequencyInHz) {
        const y = 0;
    }
    else {
        const y = frequencyToPosition(frequencyInHz, canvasHeight, minFrequency, maxFrequency);
        canvasCtx.fillStyle = color;
        canvasCtx.beginPath();
        canvasCtx.arc((canvasCtx.canvas.height / 2), y, 5, 0, Math.PI * 2);
        canvasCtx.fill();
    }
}
function frequencyToNote(frequencyInHz) {
    if (frequencyInHz != 0) {
        const pitchStandardFrequency = 440;
        const noteNames = [
            'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
        ];
        const semitoneOffset = Math.round(12 * Math.log2(frequencyInHz / pitchStandardFrequency));
        //Calcula-se a distância da nota recebida com relação ao pitch padrão "440" e multipla-se por 12 para enc
        const noteIndex = Math.round(semitoneOffset + 9) % 12;
        const positiveNoteIndex = noteIndex < 0 ? noteIndex + 12 : noteIndex;
        const octave = 4 + Math.floor((semitoneOffset + 9) / 12);
        return `${noteNames[positiveNoteIndex]}${octave}`;
    }
    else {
        return "-";
    }
}
//DrawingFunctions
function drawBackground(canvasCtx, canvas, maxFrequency, minFrequency) {
    const noteRange = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const noteHeight = canvas.height / noteRange.length;
    noteRange.forEach((note, index) => {
        const frequency = noteToFrequency(note, noteRange, minFrequency, maxFrequency);
        const y = canvas.height - ((frequency - minFrequency) / (maxFrequency - minFrequency)) * canvas.height;
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(canvas.width, y);
        canvasCtx.stroke();
        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.font = '12px Arial';
        canvasCtx.fillText(note, 10, y - 5);
    });
}
function drawCanvas(mp3Frequency, micFrequency) {
    const canvas = document.getElementById('audioCanvas');
    const canvasCtx = canvas.getContext('2d');
    const minFrequency = 130.81; //C3 Frequency
    const maxFrequency = 523.25; //C5 Frequency
    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    const mp3PointerColor = "rgb(0,128,0)";
    const pointerColor = "rgb(255, 255, 255)";
    drawBackground(canvasCtx, canvas, maxFrequency, minFrequency);
    // drawFrequencyLine(canvasCtx, lineHistory, canvas.height)
    drawFrequencyPoint(canvasCtx, micFrequency, canvas.height, minFrequency, maxFrequency, mp3PointerColor);
    drawFrequencyPoint(canvasCtx, mp3Frequency, canvas.height, minFrequency, maxFrequency, pointerColor);
    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.font = '14px Arial';
    if (micFrequency) {
        canvasCtx.fillText(`Frequência: ${Math.round(micFrequency)} Hz`, 30, 30);
        canvasCtx.fillText(`Nota: ${frequencyToNote(micFrequency)}`, 30, 50);
    }
    else {
        canvasCtx.fillText(`Frequência: - Hz`, 30, 30);
        canvasCtx.fillText(`Nota: -`, 30, 50);
    }
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
            const pointerColor = 'rgb(255, 0, 255)';
            drawCanvas(null, frequencyInHz);
        }
        draw();
    }
})
    .catch(function (err) {
    console.error("Falha ao Acessar o Microfone");
});
