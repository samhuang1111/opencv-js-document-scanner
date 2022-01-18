class ControllerCamera {
  constructor(videoElement, videoWidth, videoHeight) {
    this.webcam = videoElement;
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    this.setting = {};
    this.mediaStream = null;
    this.deviceId = null;
    this.isMobileDevice = null;
  }

  async getDeviceList(optionElement) {
    if (optionElement instanceof HTMLElement) optionElement.innerHTML = "";

    const deviceList = [];
    let devices = [];
    try {
      devices = await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.log(error);
    }

    devices.forEach((device) => {
      if (device.kind === "videoinput") {
        // custom default camera
        let label = device.label.split(" ")[0];
        if (label === "OKIOCAM") {
          this.deviceId = device.deviceId;
        }

        if (optionElement instanceof HTMLElement) {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.innerText = device.label.split(" ")[0];
          if (option.innerText === "OKIOCAM") option.selected = "selected";
          optionElement.appendChild(option);
        }

        deviceList.push(device.deviceId);
      }
    });

    return deviceList;
  }

  // handle media stream
  async handleStream(inputElement, mediaStream) {
    const tracks = mediaStream.getTracks();
    inputElement.srcObject = mediaStream;

    this.setting = tracks[0].getSettings();
    this.videoWidth = this.setting.width;
    this.videoHeight = this.setting.height;

    inputElement.oncanplay = () => {
      inputElement.play();
      return Promise.resolve("media played!");
    };
  }

  async getStream(deviceId, fps) {
    if (!fps) fps = 30;
    let constraints = {};
    if (deviceId) {
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
          facingMode: "environment",
        },
      };
    } else {
      constraints = {
        audio: false,
        video: {
          width: {
            ideal: this.videoWidth,
          },
          height: {
            ideal: this.videoHeight,
          },
          facingMode: "environment",
        },
      };
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaStream = mediaStream;
      return mediaStream;
    } catch (error) {
      console.log(error);
    }
  }

  async stopStream(videoElement) {
    if (!videoElement) videoElement = this.webcam;
    if (videoElement.srcObject) {
      const stream = videoElement.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
        return Promise.resolve("media srcObject is clear!");
      });
      videoElement.srcObject = null;
    } else {
      return Promise.resolve("media srcObject is null!");
    }
  }

  async startUpCamera(deviceId) {
    if (!deviceId) {
      deviceId = this.deviceId;
    }

    await this.stopStream();
    await this.getStream(deviceId);
    await this.handleStream(this.webcam, this.mediaStream);

    return true;
  }

  async initCamera() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.isMobileDevice = true; // true for mobile device
    } else {
      this.isMobileDevice = false; // false for not mobile device
    }

    const devices = await this.getDeviceList();
    await this.startUpCamera(this.deviceId);

    // frist access camera is reload
    if (devices.length === 1 && devices[0] === "") {
      await this.stopStream();
      await this.getDeviceList(); // frist access camera
      await this.getStream(this.deviceId);
      await this.handleStream(this.webcam, this.mediaStream);
    }

    this.webcam.width = this.videoWidth;
    this.webcam.height = this.videoHeight;

    return true;
  }
}

export { ControllerCamera };
