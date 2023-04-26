import { useContext } from "react";
import StateContext from "../../store/state-context";

import css from "./ResultingFA.module.css";
import { Graphviz } from "graphviz-react";

function ResultingFA() {
	const stateContext = useContext(StateContext);
	if (stateContext.finiteAutomata == null) { return <div />; }
	
	const currentColor = "cyan2";
	const nextColor = "orange2";
	
	const transitions = stateContext.finiteAutomata.transitions.map((transition) => {
		let key = transition.from + "::" + transition.to + "::" + transition.label;
		let color = (stateContext.currentTransitions.includes(key) ? nextColor : "");
		return transition.from + " -> " + transition.to + " [label=\"" + transition.label + "\"" + (color !== "" ? ("color=" + color + " fontcolor=" + color) : "") + "]";
	}).join("\n");
	
	const startColorKey = "s::" + stateContext.finiteAutomata.startState + "::start";
	const startColor = (stateContext.currentTransitions.includes(startColorKey) ? currentColor : "");
	
	const stateColors = stateContext.finiteAutomata.states.map((state) => {
		let color = (stateContext.currentNodes.includes(state) ? currentColor : (stateContext.nextNodes.includes(state) ? nextColor : ""));
		return state + (color !== "" ? (" [color=" + color + " fontcolor=" + color + "]") : "");
	}).join("\n");
	
	const dotString = `digraph finite_state_machine {
		fontname="Arial,Helvetica,sans-serif"
		node [fontname="Arial,Helvetica,sans-serif" penwidth=1.1]
		edge [fontname="Arial,Helvetica,sans-serif" arrowsize=0.8 arrowhead=vee penwidth=1.1]
		rankdir=LR
		
		s [shape=none style=invis fixedsize=true height=0 width=0]
		${stateContext.finiteAutomata.startState} [shape=${stateContext.finiteAutomata.acceptStates.includes(stateContext.finiteAutomata.startState) ? "doublecircle " : "circle"}]
		s -> ${stateContext.finiteAutomata.startState} [label=start ${startColor !== "" ? ("color=" + startColor + " fontcolor=" + startColor) : ""}]
		
		node [shape=doublecircle]
		${stateContext.finiteAutomata.acceptStates.join(" ")}
		
		node [shape=circle]
		${transitions}
		${stateColors}
	}`;
	
	const vizOptions = {
		width: "100%",
		height: (window.innerHeight > window.innerWidth ? "100%" : "35vh"),
		fit: true,
		zoom: false
	};
	
	return (
		<div>
			<div className={css.title}>Resulting {stateContext.finiteAutomataType}</div>
			<p>From regex: <em className={css.regex}>{stateContext.regex}</em></p>
			<Graphviz dot={dotString} options={vizOptions} />
		</div>
	);
}

export default ResultingFA;