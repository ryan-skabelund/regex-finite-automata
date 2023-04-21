import { useContext } from "react";
import StateContext from "../../store/state-context";

import css from "./FiniteAutomata.module.css"

function FiniteAutomata() {
	const stateContext = useContext(StateContext); 
	
	return (
		<div>
			<div className={css.title}>Result</div>
			<p>Regex: {stateContext.regex}</p>
			<p>Finite Automata Type: {stateContext.finiteAutomataType}</p>
		</div>
	);
}

export default FiniteAutomata;