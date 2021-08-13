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

