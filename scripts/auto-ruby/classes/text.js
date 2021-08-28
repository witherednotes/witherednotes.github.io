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
		return this.lines[idx];
	}

	getGroup(idxL, idxG) {
		return this.lines[idxL].groups[idxG];
	}

	generateHtmlOutput(omitRp, lineSep) {
		if (lineSep !== "")
			lineSep = lineSep || "\n";
		let joinee = [];
		for (let l of this.lines)
			joinee.push(l.generateHtmlOutput(omitRp));
		return joinee.join(lineSep);
	}
}
