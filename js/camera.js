class ControllerCamera {
	constructor(cameraElement, width, height) {
		this.webcam = cameraElement;
		this.webcam.width = width;
		this.webcam.height = height;
		this.videoWidth = width;
		this.videoHeight = height;
		this.currentDeviceId = null;
	}

	changeResolution(width, height) {
		this.webcam.width = width;
		this.webcam.height = height;
		this.videoWidth = width;
		this.videoHeight = height;
	}

	async stopStream(inputElement) {
		if (!inputElement) inputElement = this.webcam;

		return new Promise((resolve, reject) => {
			if (inputElement.srcObject) {
				console.log("1")
				const stream = inputElement.srcObject;
				const tracks = stream.getTracks();
				tracks.forEach((track) => {
					track.stop();
					resolve("media srcObject is stop");
				});
				inputElement.srcObject = null;
			} else {
				console.log("2")

				reject("media srcObject is null");
			}
		})
	}

	async getDeviceList(optionElement) {
		if (optionElement instanceof HTMLElement)
			optionElement.innerHTML = ''

		const deviceList = []
		const devices = await navigator.mediaDevices.enumerateDevices();

		devices.forEach((device) => {
			if (device.kind === "videoinput") {
				// custom default okiocam camera
				let label = device.label.split(" ")[0]
				if (label === "OKIOCAM")
					this.currentDeviceId = device.deviceId

				if (optionElement instanceof HTMLElement) {
					const option = document.createElement("option")
					option.value = device.deviceId
					option.innerText = device.label.split(" ")[0]
					if (option.innerText === "OKIOCAM")
						option.selected = "selected"
					optionElement.appendChild(option)
				}

				deviceList.push(device.deviceId)
			}
		});

		return deviceList;
	}

	// handle media stream
	async handleStream(inputElement, mediaStream) {
		const mediaPlay = new Promise((resolve) => {
			inputElement.srcObject = mediaStream;
			inputElement.onloadedmetadata = () => {
				inputElement.play();
				resolve("media-played");
			};
		});
		return await mediaPlay;
	}

	async getStream(deviceId, fps) {
		let constraints;

		if (!fps) fps = 30;

		if (deviceId) {
			this.currentDeviceId = deviceId
			constraints = {
				audio: false,
				video: {
					width: {
						exact: this.videoWidth,
					},
					height: {
						exact: this.videoHeight,
					},
					frameRate: { min: 15, ideal: fps, max: 30 },
					deviceId: deviceId,
				},
			};
		} else {
			constraints = {
				audio: false,
				video: {
					width: {
						min: 800, ideal: 1280, max: 1600
					},
					height: {
						min: 600, ideal: 720, max: 1200
					}
				},
			};
		}


		this.webcam.width = this.videoWidth;
		this.webcam.height = this.videoHeight;

		// devices.forEach((ele) => {
		// 	let name = ele.label.split(" ")[0];
		// 	if (name == "OKIOCAM") {
		// 		constraints.video.deviceId = ele.deviceId;
		// 	} else {
		// 		constraints.video.deviceId = ele.deviceId;
		// 	}
		// 	console.log(constraints);
		// });

		const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

		this.mediaStream = mediaStream;

		return mediaStream;
	}

}

export { ControllerCamera };