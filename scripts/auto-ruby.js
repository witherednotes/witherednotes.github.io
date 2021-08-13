// Global states
let currentSrcText = "";
let currentText = null;
let currentStep = null;

// Used to step forward/backward through AutoRubyText.
class AutoRubyStepper {
	constructor(ARText) {
		this.targetText = ARText;
		this.steps = [];    // contains lists of indices of Han groups
		this.buildSteps();

		this.currentLine = -1;    // -1 means no Han group in the text
		this.currentGroupIdx = 0;
		this.currentChar = 0;

		// find first line that has a Han group
		for (let i=0; i<this.steps.length; ++i)
		{
			if (this.steps[i].length > 0)
			{
				this.currentLine = i;
				break;
			}
		}
	}

	get currentGroup() {
		return this.steps[this.currentLine][this.currentGroupIdx];
	}

	get currentLineObj() {
		return this.targetText.lines[this.currentLine];
	}

	get currentGroupObj() {
		return this.currentLineObj.groups[this.currentGroup];
	}

	get currentCharObj() {
		return this.currentCharObj.chars[this.currentChar];
	}

	buildSteps() {
		for (let l of this.targetText.lines)
		{
			let hanGroups = [];
			for (let i=0; i<l.groups.length; ++i)
				if (l.groups[i] instanceof AutoRubyHanGroup)
					hanGroups.push(i);
			this.steps.push(hanGroups);
		}
	}

	// go to next line which contains at least one Han group
	// returns true if found one, false otherwise
	goNextLine() {
		for (let i=this.currentLine+1; i<this.steps.length; ++i)
		{
			if (this.steps[i].length)
			{
				this.currentLine = i;
				this.currentGroupIdx = 0;
				this.currentChar = 0;
				return true;
			}
		}
		return false;
	}

	goPrevLine() {
		for (let i=this.currentLine-1; i>=0; --i)
		{
			if (this.steps[i].length)
			{
				this.currentLine = i;
				this.currentGroupIdx = 0;
				this.currentChar = 0;
				return true;
			}
		}
		return false;
	}

	goNextGroup() {
		if (this.currentGroupIdx+1 < this.steps[this.currentLine].length)
		{
			++this.currentGroupIdx;
			this.currentChar = 0;
			return true;
		}
		return this.goNextLine();
	}

	goPrevGroup() {
		if (this.currentGroupIdx > 0)
		{
			--this.currentGroupIdx;
			this.currentChar = 0;
			return true;
		}
		if (this.goPrevLine())
		{
			this.currentGroupIdx = this.steps[this.currentLine].length-1;
			return true;
		}
		return false;
	}

	goNextChar() {
		const currGroup = this.targetText.getGroup(
			this.currentLine, this.currentGroup
		);
		if (this.currentChar+1 < currGroup.chars.length)
		{
			++this.currentChar;
			return true;
		}
		return goNextGroup();
	}

	goPrevChar() {
		if (this.currentChar > 0)
		{
			--this.currentChar;
			return true;
		}
		return goPrevGroup();
	}
}

// Represents an entire text.
class AutoRubyText {
	// 'text' is a string to parse
	constructor(text) {
		this.srcText = text;
		this.lines = [];    // an Array of AutoRubyLine

		const srcLines = text.split('\n');
		let lineNo = 0;
		for (let l of srcLines)
			this.lines.push(new AutoRubyLine(l, lineNo++));
	}

	getLine(idx) {
		return lines[idx];
	}

	getGroup(idxL, idxG) {
		return lines[idxL].groups[idxG];
	}
}

// Represents a line of input.
class AutoRubyLine {
	constructor(text, lineNo) {
		this.srcText = text;
		this.lineNo = lineNo;
		this.groups = [];    // an Array of either AutoRubyNonHanGroup or AutoRubyHanGroup
		this.buildGroups();
	}

	// split this.srcText into Han/Non-Han groups
	// and push them into this.groups
	buildGroups() {
		let isCurrentlyHan = false;
		let s = 0, e = 0, groupNo = 0;
		for (let c of this.srcText)
		{
			if (isHanIdeograph(c))
			{
				if (!isCurrentlyHan)
				{
					if (s < e)
						this.groups.push(new AutoRubyNonHanGroup(this.srcText.slice(s, e), groupNo++));
					s = e;
					isCurrentlyHan = true;
				}
				e += c.length;
			}
			else
			{
				if (isCurrentlyHan)
				{
					if (s < e)
						this.groups.push(new AutoRubyHanGroup(this.srcText.slice(s, e), groupNo++));
					s = e;
					isCurrentlyHan = false;
				}
				e += c.length;
			}
		}

		// deal with any leftovers
		if (s < e)
		{
			if (isCurrentlyHan)
			{
				this.groups.push(new AutoRubyHanGroup(this.srcText.slice(s, e), groupNo++));
			}
			else
			{
				this.groups.push(new AutoRubyNonHanGroup(this.srcText.slice(s, e), groupNo++));
			}
		}
	}

	generateDisplayNode() {
		let node = document.createElement("p");
		for (let g of this.groups)
			node.appendChild(g.generateDisplayNode());
		return node;
	}
}

// Represents a portion of text.
class AutoRubyGroup {
	constructor(text, groupNo) {
		this.srcText = text;
		this.groupNo = groupNo;
		this.ruby = "";
	}

	generateDisplayNode() {
		let node = document.createElement("span");
		node.innerText = this.srcText;
		return node;
	}
}

// Represents a portion of text that does not contain any han ideographs.
class AutoRubyNonHanGroup extends AutoRubyGroup {
	constructor(text, groupNo) {
		super(text, groupNo);
	}
}

// Represents a portion of text that contains only han ideographs.
class AutoRubyHanGroup extends AutoRubyGroup {
	constructor(text, groupNo, isSep, ruby) {
		super(text, groupNo);
		this.isSep = Boolean(isSep);
		this.ruby = ruby || "";
		this.chars = [];
		for (let c of this.srcText)
			this.chars.push(new AutoRubyHanChar(c));
	}

	// TODO: implement when this.isSep === true
	generateDisplayNode() {
		let node = document.createElement("span");
		node.classList.add("han-group");

		let ruby = document.createElement("ruby");
		ruby.innerText = this.srcText;

		let rubyParenLeft = document.createElement("rp");
		rubyParenLeft.innerText = '(';
		ruby.appendChild(rubyParenLeft);

		let rubyText = document.createElement("rt");
		rubyText.innerText = this.ruby;
		ruby.appendChild(rubyText);

		let rubyParenRight = document.createElement("rp");
		rubyParenRight.innerText = ')';
		ruby.appendChild(rubyParenRight);

		node.appendChild(ruby);
		return node;
	}

	setRuby(ruby) {
		this.ruby = ruby;
	}
}

// Represents individual han ideographs.
class AutoRubyHanChar {
	constructor(chr, ruby) {
		this.srcChar = chr;
		this.ruby = ruby || "";
	}
}

// isHanIdeograph():
// "is the first Unicode character in the given string a Han ideograph?"
//
// See "Table 18-1. Blocks Containing Han Ideographs" in:
// https://www.unicode.org/versions/Unicode13.0.0/ch18.pdf
//
// Note that future Unicode versions might add more Han ideographs,
// though they will practically have little to do with modern usages.
//
// TODO: check for radicals(e.g. Kangxi radicals)?
// 
function isHanIdeograph(chr)
{
	if (chr.length === 0)
		return false;

	const c = chr.codePointAt(0);

	// CJK Unified Ideographs (4E00-9FFF)
	if (0x4E00<=c && c<=0x9FFF)
		return true;

	// CJK Unified Ideographs Extension A (3400-4DBF)
	if (0x3400<=c && c<=0x4DBF)
		return true;

	// CJK Unified Ideographs Extension B (20000-2A6DF)
	if (0x20000<=c && c<=0x2A6DF)
		return true;

	// CJK Unified Ideographs Extension C (2A700-2B73F)
	// CJK Unified Ideographs Extension D (2B740-2B81F)
	// CJK Unified Ideographs Extension E (2B820-2CEAF)
	// CJK Unified Ideographs Extension F (2CEB0-2EBEF)
	if (0x2A700<=c && c<=0x2EBEF)
		return true;

	// CJK Unified Ideographs Extension G (30000-3134F)
	if (0x30000<=c && c<=0x3134F)
		return true;

	// CJK Compatibility Ideographs (F900-FAFF)
	if (0xF900<=c && c<=0xFAFF)
		return true;

	// CJK Compatibility Ideographs Supplement (2F800-2FA1F)
	if (0x2F800<=c && c<=0x2FA1F)
		return true;

	return false;
}

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
