navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
    var audioCtx = new AudioContext();
    var source = audioCtx.createMediaStreamSource(stream);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
})
    .catch(function (err) {
    console.error("Falha ao Acessar o Microfone");
});
