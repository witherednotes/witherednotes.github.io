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
