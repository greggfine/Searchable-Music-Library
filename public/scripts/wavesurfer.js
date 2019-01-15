// function(){

var cacheDOM = {
   downloader: document.getElementById("downloader"),
   trackTitle: document.getElementById('track-title'),
   current: document.getElementById("current-track"),
   timeDisplay: document.getElementById('time-display-current-time'),
   timeDisplay2: document.getElementById('time-display-duration'),
   volumeSlider: document.getElementById('volume-slider'),
   buttons: {
     play: document.getElementById("btn-play"),
     stop: document.getElementById("btn-stop")
   }
}

const Spectrum = WaveSurfer.create({
     container: '#waveform',
     progressColor: 'rgb(68,89,66)',
     waveColor: 'grey',
     cursorColor: '#999999',
     height: 44,
     pixelRatio: 1,
     responsive: true,
     scrollParent: false,
});

window.onload = () => {
     Spectrum.load('https://immense-atoll-44421.herokuapp.com/audio/' + cacheDOM.current.textContent)
    // Spectrum.load('http://localhost:8080/audio/' + cacheDOM.current.textContent);

    cacheDOM.trackTitle.innerHTML = cacheDOM.current.textContent;
    downloader.setAttribute('href', 'https://immense-atoll-44421.herokuapp.com/audio/' + cacheDOM.current.textContent);
    // downloader.setAttribute('href', 'http://localhost:8080/audio/' + cacheDOM.current.textContent);

    cacheDOM.buttons.play.classList.add('fa-play');
}

window.addEventListener("resize", () => {
   const currentProgress = Spectrum.getCurrentTime() / Spectrum.getDuration();
   Spectrum.seekTo(currentProgress);
}, false);



function loadTrack(trackName, data) {
  var progress = document.getElementById("progress");

  var curTrack = `https://immense-atoll-44421.herokuapp.com/files/audio/trackName${trackName}`;
  // const curTrack = `http://localhost:8080/files/audio/${trackName}`;

  let playState = false;

  //  Create the waveform for the currently selected track
  Spectrum.load(curTrack);

  //  document.getElementById("progress").style.display = "block";

  Spectrum.on("loading", percents => {
    progress.innerHTML = `${percents}% loading...`;
  });

  Spectrum.on("ready", percents => {
    playState = true;
    Spectrum.play();
    document.getElementById("progress").style.display = "none";
    cacheDOM.buttons.play.classList.add("fa-pause");
  });

  cacheDOM.buttons.play.addEventListener("click", e => {
    if (!playState) {
      Spectrum.play();
      playState = true;
      e.target.classList.add("fa-pause");
    } else {
      Spectrum.pause();
      playState = false;
      e.target.classList.remove("fa-pause");
      e.target.classList.add("fa-play");
    }
  });

  cacheDOM.buttons.stop.addEventListener("click", () => {
    Spectrum.stop();
    playState = false;
    cacheDOM.buttons.play.classList.remove("fa-pause");
    cacheDOM.buttons.pause.classList.add("fa-play");
  });

  cacheDOM.volumeSlider.addEventListener("input", e => {
    Spectrum.setVolume(e.target.value);
  });

  downloader.setAttribute("href", curTrack);
  cacheDOM.trackTitle.innerHTML = data;

  // =============== TIME DISPLAY  =========================
  var formatTime = function(time) {
    return [
      Math.floor((time % 3600) / 60),
      ("00" + Math.floor(time % 60)).slice(-2)
    ].join(":"); // minutes // seconds
  };

  // Show current time
  Spectrum.on("audioprocess", () => {
    cacheDOM.timeDisplay.textContent = formatTime(Spectrum.getCurrentTime());
  });

  // Show clip duration
  Spectrum.on("ready", () => {
    cacheDOM.timeDisplay2.textContent =
      "/ " + formatTime(Spectrum.getDuration());
  });
}

// } ();