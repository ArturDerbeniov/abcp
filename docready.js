document.addEventListener("click", eventDocClick, false);
window.addEventListener("load", eventWinLoad, false);

window.barcodeScanInited = false;


//срабатывает после docready
//сюда писать скрипт, который нелючевой и допускает более поздней загрузки
function eventWinLoad(e) {
	document.body.insertAdjacentHTML("beforeend", "444444444444444444444");
}

//глобальный обработчик кликов по документу
function eventDocClick(e) {
    var targ = e.target;
    var clickedEl = e.target;

    while (targ && targ != this) {

        
        

		if (targ.classList.contains("barcodeScan")) {

			if (!window.barcodeScanInited) {
				window.barcodeScanInited = true;
				loadJS("quagga2.min.js", barcodeScan.init, document.body);
			}
			else {
				barcodeScan.init();
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

var barcodeScan = {
	_scannerIsRunning: false,
	init: function () {
		if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
			document.body.classList.add("scannerRanning-init");
			document.body.classList.add("scannerRanning-loading");

			Quagga.init({
				inputStream: {
					name: "Live",
					type: "LiveStream",
					target: document.body
					/* constraints: {
						width: 350,
						height: 200,
						facingMode: "environment"
					} */
					,
					area: { // defines rectangle of the detection/localization area
						top: "0%",    // top offset
						right: "0%",  // right offset
						left: "0%",   // left offset
						bottom: "0%"  // bottom offset
					},
					singleChannel: false // true: only the red color-channel is read
				}/* ,
				readers: [
					"code_128_reader",
					"ean_reader",
					"ean_8_reader",
					"code_39_reader",
					"code_39_vin_reader",
					"codabar_reader",
					"upc_reader",
					"upc_e_reader",
					"i2of5_reader"
				] */,
				halfSample: true,
				patchSize: "medium",
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
					},
					drawBoundingBox: true,
					showFrequency: true,
					drawScanline: true,
					showPattern: true
				},
				multiple: false

			}, function (err) {
				if (err) {
					console.log(err);
					document.body.classList.remove("scannerRanning-init");
					document.body.classList.remove("scannerRanning-loading");
					return
				}
				Quagga.start();
				document.body.classList.remove("scannerRanning-loading");
				window.barcodeScan._scannerIsRunning = true;
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
				if (result.codeResult && result.codeResult.code) {
					
					barcodeScan.close();

					barcodeScan.gotoSearchPage(result.codeResult.code);					
					
					console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
				}
			});
		}
	},
	close: function() {
		if(this._scannerIsRunning) {
			setTimeout(function () {
				Quagga.stop();
				_scannerIsRunning = false;
				
				window.barcodeScan.clean();
			}, 700);
		}
		else {
			window.barcodeScan.clean();
		}
		
	},
	clean: function() {
		
		barcodeScan.removeVideoCanvas();

		document.body.classList.remove("scannerRanning-init");
		document.body.classList.remove("scannerRanning-loading");
	},
	removeVideoCanvas: function() {
		let v, c;

		if (v = document.querySelector("body > video")) {
			v.parentNode.removeChild(v);
		}
		if (c = document.querySelector(".drawingBuffer")) {
			c.parentNode.removeChild(c);
		}
	},
	gotoSearchPage: function(s) {
		document.body.classList.add("scannerRanning-gotoSearhcPage");		

		window.location.href = "/" + getLanguage() + "/search/?q=" + s;
	}
}
