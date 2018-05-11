// Store the 3 buttons in some object
 var buttons = {
     play: document.getElementById("btn-play"),
     pause: document.getElementById("btn-pause"),
     stop: document.getElementById("btn-stop")
 };

 var downloader = document.getElementById("downloader");

 // Create an instance of wave surfer with its configuration
 var Spectrum = WaveSurfer.create({
     container: '#waveform',
     waveColor: '#darkgrey',
     // waveColor: '#C9DD4B',
     progressColor: '#61892f',
     cursorColor: '#999999',
     pixelRatio: 1,
     scrollParent: false
 });

 // Handle Play button
 buttons.play.addEventListener("click", function(){
     Spectrum.play();

     // Enable/Disable respectively buttons
     buttons.stop.disabled = false;
     buttons.pause.disabled = false;
     buttons.play.disabled = true;
 }, false);

 // Handle Pause button
 buttons.pause.addEventListener("click", function(){
     Spectrum.pause();

     // Enable/Disable respectively buttons
     buttons.pause.disabled = true;
     buttons.play.disabled = false;
 }, false);


 // Handle Stop button
 buttons.stop.addEventListener("click", function(){
     Spectrum.stop();

     // Enable/Disable respectively buttons
     buttons.pause.disabled = true;
     buttons.play.disabled = false;
     buttons.stop.disabled = true;
 }, false);


 // Add a listener to enable the play button once it's ready
 Spectrum.on('ready', function () {
     buttons.play.disabled = false;
    
 });


 var trackTitle = document.getElementById('track-title');
 // If you want a responsive mode (so when the user resizes the window)
 // the spectrum will be still playable
 window.addEventListener("resize", function(){
     // Get the current progress according to the cursor position
     var currentProgress = Spectrum.getCurrentTime() / Spectrum.getDuration();

     // Reset graph
     Spectrum.empty();
     Spectrum.drawBuffer();
     // Set original position
     Spectrum.seekTo(currentProgress);

     // Enable/Disable respectively buttons
     buttons.pause.disabled = true;
     buttons.play.disabled = false;
     buttons.stop.disabled = false;
 }, false);

 // Load the audio file from your domain !

  var current = document.getElementById("current-track");

window.onload = function(){
    // Spectrum.load('http://127.0.0.1:8080/audio/' + current.value)
    Spectrum.load('https://immense-atoll-44421.herokuapp.com/audio/' + current.value);
	// Spectrum.load('http://localhost:8080/audio/' + current.textContent)
	// Spectrum.load('https://vast-dusk-24076.herokuapp.com/audio/' + current.textContent)
	trackTitle.innerHTML = current.textContent;
}

  function runIt(trackName, data){
    console.log(data)
    // var curTrack = 'http://127.0.0.1:8080/audio/' + trackName;
    var curTrack = 'https://immense-atoll-44421.herokuapp.com/audio/' + trackName;
  	// var curTrack = 'http://localhost:8080/audio/' + trackName;
  	// var curTrack = 'https://vast-dusk-24076.herokuapp.com/audio/' + trackName;
	Spectrum.load(curTrack);
	downloader.setAttribute('href', curTrack);
	trackTitle.innerHTML = data;
  }