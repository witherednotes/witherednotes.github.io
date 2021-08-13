// Represents individual han ideographs.
class AutoRubyHanChar {
	constructor(chr, ruby) {
		this.srcChar = chr;
		this.ruby = ruby || "";
	}

	generateDisplayNode(omitRp) {
		let ruby = document.createElement("ruby");
		ruby.innerText = this.srcChar;

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

		return ruby;
	}

	setRuby(ruby) {
		this.ruby = ruby;
	}
}
