navigator.mediaDevices.getUserMedia({audio:true})
.then (function(stream){
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let lastValidFrequency = 0;
    const canvas =<HTMLCanvasElement> document.getElementById('audioCanvas');
    if(canvas == null){
        console.error("Canvas recebeu null")
    }else{
        const canvasCtx =<CanvasRenderingContext2D> canvas.getContext('2d');
        let lineHistory: number[] = [];
        function draw (){
            requestAnimationFrame(draw);
    
            analyser.getByteFrequencyData(dataArray);
            const sampleRate = audioCtx.sampleRate;
    
            let maxIndexByteFrequency = 0;
            for (let i = 1; i<bufferLength; i++){
                if (dataArray[i] > dataArray[maxIndexByteFrequency]){
                    maxIndexByteFrequency = i;
                }
            }
    
            const frequencyInHz = maxIndexByteFrequency * (sampleRate/2)/bufferLength; 

            const validThreshold = 500;
            if (Math.abs(frequencyInHz - lastValidFrequency) < validThreshold){
                lineHistory.push(frequencyInHz);
                lastValidFrequency = frequencyInHz;
            }
            if (lineHistory.length > canvas.width){
                lineHistory.shift();
            }
            
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.beginPath();
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
            canvasCtx.moveTo(0, canvas.height - (lineHistory[0] / 1000 * canvas.height));

            for (let i = 1; i < lineHistory.length; i++){
                const y = canvas.height - (lineHistory[i] / 1000 * canvas.height);
                canvasCtx.lineTo(i,y);
            }

            canvasCtx.stroke();
           /* const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
        
                canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
                x += barWidth +1;
                */
                canvasCtx.fillStyle = 'rgb(255, 255, 255)';
                canvasCtx.font = '20px Arial';
                canvasCtx.fillText(`Frequência: ${Math.round(frequencyInHz)} Hz`, 10, 30); 
    }  
    draw();
}
})
.catch(function(err){
    console.error("Falha ao Acessar o Microfone")
})