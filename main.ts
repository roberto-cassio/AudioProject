navigator.mediaDevices.getUserMedia({audio:true})
.then (function(stream){
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

})
.catch(function(err){
    console.error("Falha ao Acessar o Microfone")
})