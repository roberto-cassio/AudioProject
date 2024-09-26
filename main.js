navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
    var audioCtx = new AudioContext();
    var source = audioCtx.createMediaStreamSource(stream);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    var lastValidFrequency = 0;
    var canvas = document.getElementById('audioCanvas');
    if (canvas == null) {
        console.error("Canvas recebeu null");
    }
    else {
        var canvasCtx_1 = canvas.getContext('2d');
        var lineHistory_1 = [];
        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            var sampleRate = audioCtx.sampleRate;
            var maxIndexByteFrequency = 0;
            for (var i = 1; i < bufferLength; i++) {
                if (dataArray[i] > dataArray[maxIndexByteFrequency]) {
                    maxIndexByteFrequency = i;
                }
            }
            var frequencyInHz = maxIndexByteFrequency * (sampleRate / 2) / bufferLength;
            var validThreshold = 500;
            if (Math.abs(frequencyInHz - lastValidFrequency) < validThreshold) {
                lineHistory_1.push(frequencyInHz);
                lastValidFrequency = frequencyInHz;
            }
            if (lineHistory_1.length > canvas.width) {
                lineHistory_1.shift();
            }
            canvasCtx_1.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx_1.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx_1.beginPath();
            canvasCtx_1.lineWidth = 2;
            canvasCtx_1.strokeStyle = 'rgb(255, 255, 255)';
            canvasCtx_1.moveTo(0, canvas.height - (lineHistory_1[0] / 1000 * canvas.height));
            for (var i = 1; i < lineHistory_1.length; i++) {
                var y = canvas.height - (lineHistory_1[i] / 1000 * canvas.height);
                canvasCtx_1.lineTo(i, y);
            }
            canvasCtx_1.stroke();
            /* const barWidth = (canvas.width / bufferLength) * 2.5;
             let barHeight;
             let x = 0;
 
             for (let i = 0; i < bufferLength; i++) {
                 barHeight = dataArray[i];
         
                 canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                 canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
                 x += barWidth +1;
                 */
            canvasCtx_1.fillStyle = 'rgb(255, 255, 255)';
            canvasCtx_1.font = '20px Arial';
            canvasCtx_1.fillText("Frequ\u00EAncia: ".concat(Math.round(frequencyInHz), " Hz"), 10, 30);
        }
        draw();
    }
})
    .catch(function (err) {
    console.error("Falha ao Acessar o Microfone");
});
