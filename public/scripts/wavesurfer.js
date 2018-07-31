const buttons = {
    play: document.getElementById("btn-play"),
    stop: document.getElementById("btn-stop")
};

const downloader = document.getElementById("downloader");
const trackTitle = document.getElementById('track-title');
const current = document.getElementById("current-track");
const timeDisplay = document.getElementById('time-display-current-time');
const timeDisplay2 = document.getElementById('time-display-duration');
const volumeSlider = document.getElementById('volume-slider');


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

window.onload = function(){
    //  Spectrum.load('https://immense-atoll-44421.herokuapp.com/audio/' + current.textContent)
    Spectrum.load('http://localhost:8080/audio/' + current.textContent);

    trackTitle.innerHTML = current.textContent;
   //  downloader.setAttribute('href', 'https://immense-atoll-44421.herokuapp.com/audio/' + current.textContent);
    downloader.setAttribute('href', 'http://localhost:8080/audio/' + current.textContent);

    buttons.play.classList.add('fa-play');
}

window.addEventListener("resize", function(){
   const currentProgress = Spectrum.getCurrentTime() / Spectrum.getDuration();
   Spectrum.seekTo(currentProgress);
}, false);



function runIt(trackName, data){
    // var curTrack = 'https://immense-atoll-44421.herokuapp.com/audio/' + trackName;
    const curTrack = 'http://localhost:8080/audio/' + trackName;
    let playState = false;
    
    Spectrum.load(curTrack);
    
    document.getElementById('progress').style.display = 'block';
    
    Spectrum.on('loading', function (percents) {
        document.getElementById('progress').innerHTML = `${percents}% loading...`;
    });  


    Spectrum.on('ready', function (percents) {
        playState = true;
        Spectrum.play();
        document.getElementById('progress').style.display = 'none';
        buttons.play.classList.add('fa-pause')
    });  

    buttons.play.addEventListener("click", function(e){
        if(!playState){
            Spectrum.play();
            playState = true;
            e.target.classList.add('fa-pause')
        } else{
            Spectrum.pause();
            playState = false;
            e.target.classList.remove('fa-pause')
            e.target.classList.add('fa-play')
        }
    });

    buttons.stop.addEventListener("click", function(){
        Spectrum.stop();
        playState = false;
        buttons.play.classList.remove('fa-pause')
        buttons.pause.classList.add('fa-play')
    }); 

    volumeSlider.addEventListener('input', function(e){
        Spectrum.setVolume(e.target.value);
    })

	downloader.setAttribute('href', curTrack);
    trackTitle.innerHTML = data;

    // =============== TIME DISPLAY  =========================
    var formatTime = function (time) {
        return [
            Math.floor((time % 3600) / 60), // minutes
            ('00' + Math.floor(time % 60)).slice(-2) // seconds
        ].join(':');
    };

        // Show current time
    Spectrum.on('audioprocess', function () {
        timeDisplay.textContent = ( formatTime(Spectrum.getCurrentTime()) );
    });

    // Show clip duration
    Spectrum.on('ready', function () {
        timeDisplay2.textContent = '/ ' + ( formatTime(Spectrum.getDuration()) );
    });
}
