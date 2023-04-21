import { useRef } from "react";

import css from "./InputRegex.module.css";
import Button from "../ui/Button";

function InputRegex(props) {
	const regexInputRef = useRef();
	
	function onClickHandler(finiteAutomataType) {
		const inputtedRegex = regexInputRef.current.value;
		props.parseRegex(inputtedRegex, finiteAutomataType);
	}
	
	return (
		<div>
			<div className={css.title}>Input Regex</div>
			<div>
				<p>The following are supported by the regex parser:</p>
				<ul className={css.list}>
					<li><code>ε</code>: The empty string.</li>
					<li><code>|</code>: Matches either the expression before or the expression after the operator.</li>
					<li><code>*</code>: Matches the preceding element zero or more times.</li>
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