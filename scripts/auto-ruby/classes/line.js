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
