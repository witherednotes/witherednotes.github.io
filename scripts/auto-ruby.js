// Global states
let currentSrcText = "";
let currentText = null;

let currentLine = 0;
let currentGroup = 0;
let currentChar = 0;

// Used to step forward/backward through AutoRubyText.
class AutoRubyStepper {
	constructor(ARText) {
		this.targetText = ARText;
		this.steps = [];
		buildSteps();

		this.currentLine = 0;
		this.currentGroupIdx = 0;
		this.currentChar = 0;
	}

	get currentGroup() {
		return this.steps[this.currentLine][this.currentGroupIdx];
	}

	buildSteps() {
		for (let l of this.targetText)
		{
			let hanGroups = [];
			for (let i=0; i<l.length; ++i)
				if (l[i] instanceof AutoRubyHanGroup)
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
				this.currentGroup = 0;
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
				this.currentGroup = 0;
				this.currentChar = 0;
				return true;
			}
		}
		return false;
	}

	goNextGroup() {
		if (this.currentGroup+1 < this.steps[this.currentLine].length)
		{
			++this.currentGroupIdx;
			this.currentChar = 0;
			return true;
		}
		return false;
	}

	goPrevGroup() {
		if (this.currentGroup > 0)
		{
			--this.currentGroupIdx;
			this.currentChar = 0;
			return true;
		}
		return false;
	}

	goNextChar() {
	}

	goPrevChar() {
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
	constructor(text, groupNo, isSep) {
		super(text, groupNo);
		this.isSep = Boolean(isSep);
		this.chars = [];
		for (let c of this.srcText)
			this.chars.push(new AutoRubyHanChar(c));
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
	let prev = null, curr = null, next = null;
	if (currentLine > 0)
		prev = currentText.lines[currentLine-1];
	curr = currentText.lines[currentLine];
	if (currentLine < currentText.lines.length-1)
		next = currentText.lines[currentLine+1];

	let dispPrev = document.getElementById("progress-display-prev");
	let dispCurr = document.getElementById("progress-display-curr");
	let dispNext = document.getElementById("progress-display-next");

	dispPrev.textContent = "";
	dispCurr.textContent = "";
	dispNext.textContent = "";

	if (prev) dispPrev.appendChild(prev.generateDisplayNode());
	dispCurr.appendChild(curr.generateDisplayNode());
	if (next) dispNext.appendChild(next.generateDisplayNode());
}

function searchInitialLine()
{
	for (let i=0; i<currentText.lines.length; ++i)
	{
		if (currentText.lines[i].groups.length > 0)
		{
			currentLine = i;
			currentGroup = 0;
			return true;
		}
	}
	return false;
}

function goNextGroup()
{
	if (currentGroup === currentText.lines[currentLine].groups.length-1)    // is last group?
	{
		if (currentLine === currentText.lines.length-1)    // is last line?
			return false;
		++currentLine;
		currentGroup = 0;
	}
	else
	{
		++currentGroup;
	}
	return true;
}

function initializeRubyInput()
{
	currentSrcText = document.getElementById("text-input").value;
	currentText = new AutoRubyText(currentSrcText);
	searchInitialLine();
	refreshProgressDisplay();
}

function registerEvents()
{
	document.getElementById("text-input-commit-button").onclick = function (e) {
		initializeRubyInput();
	};
	document.getElementById("ruby-input-next").onclick = function (e) {
		goNextGroup();
		refreshProgressDisplay();
	};
}

window.addEventListener("load", function (e) {
	registerEvents();
});
