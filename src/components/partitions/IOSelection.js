import css from "./IOSelection.module.css";
import Dropdown from "../ui/Dropdown";

function IOSelection() {
	return (
		<div className={css.row}>
			<Dropdown
				id="input"
				label="Choose Input"
				options={["DFA", "NFA", "GNFA", "Regex"]}
				defaultValue="Regex"
			/>
			<Dropdown
				id="output"
				label="Choose Output"
				options={["DFA", "NFA", "GNFA", "Regex"]}
				defaultValue="DFA"
			/>
		</div>
	);
}

export default IOSelection;