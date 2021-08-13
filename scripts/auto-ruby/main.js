// Global states
let currentSrcText = "";
let currentText = null;
let currentStep = null;

function refreshProgressDisplay()
{
	let l = currentStep.currentLine;
	let g = currentStep.currentGroup;
	let c = currentStep.currentChar;

	let prev = null, curr = null, next = null;
	if (l > 0)
		prev = currentText.lines[l-1];
	curr = currentText.lines[l];
	if (l < currentText.lines.length-1)
		next = currentText.lines[l+1];

	let dispPrev = document.getElementById("progress-display-prev");
	let dispCurr = document.getElementById("progress-display-curr");
	let dispNext = document.getElementById("progress-display-next");

	dispPrev.textContent = "";
	dispCurr.textContent = "";
	dispNext.textContent = "";

	let nodeCurr = curr.generateDisplayNode();
	nodeCurr.childNodes[currentStep.currentGroup].classList.add("current-group");
	if (prev) dispPrev.appendChild(prev.generateDisplayNode());
	if (next) dispNext.appendChild(next.generateDisplayNode());
	dispCurr.appendChild(nodeCurr);
}

function initializeRubyInput()
{
	currentSrcText = document.getElementById("text-input").value;
	currentText = new AutoRubyText(currentSrcText);
	currentStep = new AutoRubyStepper(currentText);
	refreshProgressDisplay();
}

function registerEvents()
{
	document.getElementById("text-input-commit-button").onclick = function (e) {
		initializeRubyInput();
	};
	document.getElementById("ruby-input-next").onclick = function (e) {
		currentStep.goNextGroup();
		let rubyInput = document.getElementById("ruby-input");
		rubyInput.value = currentStep.currentGroupObj.ruby;
		refreshProgressDisplay();
	};
	document.getElementById("ruby-input-prev").onclick = function (e) {
		currentStep.goPrevGroup();
		let rubyInput = document.getElementById("ruby-input");
		rubyInput.value = currentStep.currentGroupObj.ruby;
		refreshProgressDisplay();
	};
	document.getElementById("ruby-input").onchange = function (e) {
		let ruby = document.getElementById("ruby-input").value;
		currentStep.currentGroupObj.setRuby(ruby);
		refreshProgressDisplay();
	};
}

window.addEventListener("load", function (e) {
	registerEvents();
});
