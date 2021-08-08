// Represents an entire text.
class AutoRubyText {
	constructor(text) {
		this.srcText = text;
		this.lines = [];    // an Array of AutoRubyLine
		const srcLines = text.split('\n');
		for (let l of srcLines)
			this.lines.push(new AutoRubyLine(l));
	}
}

// Represents a line of input.
class AutoRubyLine {
	constructor(text) {
		this.srcText = text;
		this.groups = [];    // an Array of either AutoRubyNonHanGroup or AutoRubyHanGroup
		this.buildGroups();
	}

	// split this.srcText into Han/Non-Han groups
	// and push them into this.groups
	buildGroups() {
		let isCurrentlyHan = false;
		let s = 0, e = 0;
		for (let c of this.srcText)
		{
			if (isHanIdeograph(c))
			{
				if (!isCurrentlyHan)
				{
					if (s < e)
						this.groups.push(new AutoRubyNonHanGroup(text.slice(s, e)));
					s = e;
				}
				e += c.length;
			}
			else
			{
				if (isCurrentlyHan)
				{
					if (s < e)
						this.groups.push(new AutoRubyHanGroup(text.slice(s, e)));
					s = e;
				}
				e += c.length;
			}
		}

		// deal with any leftovers
		if (s < e)
		{
			if (isCurrentlyHan)
			{
				this.groups.push(new AutoRubyHanGroup(text.slice(s, e)));
			}
			else
			{
				this.groups.push(new AutoRubyNonHanGroup(text.slice(s, e)));
			}
		}
	}
}

// Represents a portion of text.
class AutoRubyGroup {
	constructor(text) {
		this.srcText = text;
	}
}

// Represents a portion of text that does not contain any han ideographs.
class AutoRubyNonHanGroup extends AutoRubyGroup {
	constructor(text) {
		super(text);
	}
}

// Represents a portion of text that contains only han ideographs.
class AutoRubyHanGroup extends AutoRubyGroup {
	constructor(text) {
		super(text);
	}
}

// Represents individual han ideographs.
class AutoRubyHanChar {
	constructor(chr) {
		this.srcChar = chr;
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
