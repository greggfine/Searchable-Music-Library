// < !--Sets and retains dropdown display to the selected genre / bpm / length-- >

var selectedList = document.querySelectorAll('.selected-list');
var genreList = document.getElementById('genre');
var bpmList = document.getElementById('bpm');
var lengthList = document.getElementById('length');



// Loop through the available options
// Find the available option that matches my choice(selection.textContent)
// Set its value to "selected"
function setSelectedIndex(listContents, myChoice) {
    var list = Array.from(listContents.options);

    list.forEach((option) => {
        if(option.text === myChoice) {
            option.selected = true;
        }
    })
}

Array.from(selectedList).forEach((selection) => {
    setSelectedIndex(genreList, selection.textContent);
    setSelectedIndex(bpmList, selection.textContent);
    setSelectedIndex(lengthList, selection.textContent);
})





