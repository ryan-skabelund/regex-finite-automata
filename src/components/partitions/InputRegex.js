import { useRef } from "react";
import { useContext } from "react";
import StateContext from "../../store/state-context";

import css from "./InputRegex.module.css";
import Button from "../ui/Button";

function escapeHtml(string) {
	var charMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	};
	return String(string).replace(/[&<>"'`=\\/]/g, function(s) {
		return charMap[s];
	});
}

function InputRegex() {
	const regexInputRef = useRef();
	const stateContext = useContext(StateContext); 
	
	function onClickHandler(finiteAutomataType) {
		const inputtedRegex = regexInputRef.current.value;
		stateContext.updateData({
			regex: escapeHtml(inputtedRegex),
			finiteAutomataType: finiteAutomataType
		});
	}
	
	return (
		<div>
			<div className={css.title}>Input Regex</div>
			<div>
				<p>The following are supported by the regex parser:</p>
				<ul className={css.list}>
					<li><code>ε</code>: Epsilon - The empty string.</li>
					<li><code>|</code>: Alternation - Matches either the expression before or the expression after the operator.</li>
					<li><code>*</code>: Kleene Star - Matches the preceding element zero or more times.</li>
					<li><code>?</code>: Matches the preceding element zero or one time.</li>
					<li><code>+</code>: Matches the preceding element one or more times.</li>
					<li><code>()</code>: Denotes a capturing group.</li>
				</ul>
			</div>
			<label htmlFor="regex">Please enter the regex you'd like to convert below:</label>
			<input className={css.input} type="text" ref={regexInputRef} id="regex" name="regex" spellCheck={false}></input>
			<div className={css.actions}>
				<Button caption="Convert to DFA" id="DFA" onClick={onClickHandler} />
				<Button caption="Convert to NFA" id="NFA" onClick={onClickHandler} />
				<Button caption="Convert to GNFA" id="GNFA" onClick={onClickHandler} />
			</div>
		</div>
	);
}

export default InputRegex;