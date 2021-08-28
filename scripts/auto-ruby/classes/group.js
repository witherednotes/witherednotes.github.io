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

	generateHtmlOutput() {
		return this.srcText;
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

	generateDisplayNode(omitRp) {
		let node = document.createElement("span");
		node.classList.add("han-group");

		if (this.isSep)
		{
			for (let c of this.chars)
				node.appendChild(c.generateDisplayNode());
		}
		else
		{
			let ruby = document.createElement("ruby");
			ruby.innerText = this.srcText;

			if (!omitRp)
			{
				let rubyParenLeft = document.createElement("rp");
				rubyParenLeft.innerText = '(';
				ruby.appendChild(rubyParenLeft);
			}

			let rubyText = document.createElement("rt");
			rubyText.innerText = this.ruby;
			ruby.appendChild(rubyText);

			if (!omitRp)
			{
				let rubyParenRight = document.createElement("rp");
				rubyParenRight.innerText = ')';
				ruby.appendChild(rubyParenRight);
			}

			node.appendChild(ruby);
		}

		return node;
	}

	generateHtmlOutput(omitRp) {
		if (this.isSep)
		{
			let joinee = [];
			for (let c of this.chars)
				joinee.push(c.generateHtmlOutput(omitRp));
			return joinee.join("");
		}
		else
		{
			let joinee = [];
			if (this.ruby)
			{
				joinee.push("<ruby>", this.srcText);
				if (!omitRp) joinee.push("<rp>(</rp>");
				joinee.push("<rt>", this.ruby, "</rt>");
				if (!omitRp) joinee.push("<rp>)</rp>");
				joinee.push("</ruby>");
				return joinee.join("");
			}
			else
			{
				return this.srcText;
			}
		}
	}

	setRuby(ruby) {
		this.ruby = ruby;
	}
}
