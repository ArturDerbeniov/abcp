document.addEventListener("click", eventDocClick, false);
window.addEventListener("load", eventWinLoad, false);

window.barcodeScanInited = false;


//срабатывает после docready
//сюда писать скрипт, который нелючевой и допускает более поздней загрузки
function eventWinLoad(e) {
}

//глобальный обработчик кликов по документу
function eventDocClick(e) {
    var targ = e.target;
    var clickedEl = e.target;

    while (targ && targ != this) {

        
        

		if(targ.classList.contains("barcodeScan")) {
			
			if(!window.barcodeScanInited) {
				window.barcodeScanInited = true;
				loadJS("/js/plugins/quagga.min.js", barcodeScanInit, document.body);
			}
			else {
				barcodeScanInit();
			}

			function barcodeScanInit() {
				if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
					console.log("barcodeScanInit");
					Quagga.init({
						inputStream: {
							name: "Live",
							type: "LiveStream",
							target: document.body,
							constraints: {
								width: 480,
								height: 320,
								facingMode: "environment"
							},
						},
						readers: [
							"code_128_reader"/* ,
							"ean_reader",
							"ean_8_reader",
							"code_39_reader",
							"code_39_vin_reader",
							"codabar_reader",
							"upc_reader",
							"upc_e_reader",
							"i2of5_reader" */
						],
						debug: {
							showCanvas: true,
							showPatches: true,
							showFoundPatches: true,
							showSkeleton: true,
							showLabels: true,
							showPatchLabels: true,
							showRemainingPatchLabels: true,
							boxFromPatches: {
								showTransformed: true,
								showTransformedBox: true,
								showBB: true
							}
						}
					}, function (err) {
						if (err) {
							console.log(err);
							return
						}
						console.log("Initialization finished. Ready to start");
						Quagga.start();
						// Set flag to is running
						_scannerIsRunning = true;
						
					});
					Quagga.onProcessed(function (result) {
						var drawingCtx = Quagga.canvas.ctx.overlay,
							drawingCanvas = Quagga.canvas.dom.overlay;

						if (result) {
							if (result.boxes) {
								drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
								result.boxes.filter(function (box) {
									return box !== result.box;
								}).forEach(function (box) {
									Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
								});
							}

							if (result.box) {
								Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
							}

							if (result.codeResult && result.codeResult.code) {
								Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
							}
						}
					});


					Quagga.onDetected(function (result) {
						console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
					});
				}
			}

			
			break;
		}

        targ = targ.parentNode;
    }
};

var loadJS = function(url, callback, locToInsert){
	var scriptTag = document.createElement('script');
	scriptTag.src = url;

	scriptTag.onload = callback;
	scriptTag.onreadystatechange = callback;

	locToInsert.appendChild(scriptTag);
};
