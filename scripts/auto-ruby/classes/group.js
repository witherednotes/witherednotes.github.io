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
