import css from "./Dropdown.module.css";

function Dropdown(props) {
	return (
		<div className={css.dropdown}>
			<label htmlFor={props.id}>{props.label}:</label>
			<select name={props.id} id={props.id} defaultValue={props.defaultValue}>
				{props.options.map(option => (
					<option value={option}>{option}</option>
				))}
			</select>
		</div>
	);
}

export default Dropdown;