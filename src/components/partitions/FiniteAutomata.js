import { useContext } from "react";
import StateContext from "../../store/state-context";

import css from "./FiniteAutomata.module.css";
import { Graphviz } from "graphviz-react";

class NFA {
	constructor(startState) {
		this.transitions = [];
		this.startState = startState;
		this.acceptStates = [];
	}
	
	addTransition(from, to, label) {
		this.transitions.push({
			from: from,
			to: to,
			label: label
		});
	}
	
	addAcceptState(newAcceptState) {
		this.acceptStates.push(newAcceptState);
	}
}

function concatenate(nfa1, nfa2) {
	let newNFA = new NFA(nfa1.startState);
	newNFA.acceptStates = nfa2.acceptStates;
	newNFA.transitions = nfa1.transitions.concat(nfa2.transitions);
	nfa1.acceptStates.forEach(acceptState => {
		newNFA.addTransition(acceptState, nfa2.startState, "ε");
	});
	return newNFA;
}

function union(alternations, stateNum) {
	const initialState = "q" + stateNum;
	let newNFA = new NFA(initialState)
	alternations.forEach(nfa => {
		newNFA.acceptStates = newNFA.acceptStates.concat(nfa.acceptStates);
		newNFA.transitions = newNFA.transitions.concat(nfa.transitions);
		newNFA.addTransition(initialState, nfa.startState, "ε");
	});
	return newNFA;
}

function quantify(nfa, quantifier, stateNum) {
	const originalStartState = nfa.startState;
	const newStartState = "q" + stateNum;
	if (quantifier === "*" || quantifier === "+")
	nfa.acceptStates.forEach(acceptState => {
		nfa.addTransition(acceptState, originalStartState, "ε");
	});
	nfa.addTransition(newStartState, originalStartState, "ε");
	nfa.startState = newStartState;
	if (quantifier === "*" || quantifier === "?") {
		nfa.addAcceptState(newStartState);
	}
	return nfa;
}

function createGNFA(regexString) {
	let gnfa = new NFA("q0");
	gnfa.addAcceptState("q1");
	gnfa.addTransition("q0", "q1", regexString);
	return gnfa;
}

function createNFA(regexString, stateNum=0) {
	let tokens = regexString.split(/(&.*?;)|/g).filter(n => n).reverse();
		
	let alternations = [];
	let currentNFA = null;
	
	while (tokens.length > 0) {
		let tok = tokens.pop();
		if (tok === "(") {
			let [subNFA, newTokens, newStateNum] = createNFA(tokens.reverse().join(""), stateNum);
			tokens = newTokens;
			stateNum = newStateNum;
			const nextToken = (tokens.length > 0 ? tokens[tokens.length - 1] : "");
			if (nextToken === "*" || nextToken === "?" || nextToken === "+") {
				subNFA = quantify(subNFA, tokens.pop(), stateNum++);
			}
			if (currentNFA === null) {
				currentNFA = subNFA;
			} else {
				currentNFA = concatenate(currentNFA, subNFA);
			}
		} else if (tok === ")") {
			break;
		} else if (tok === "|") {
			alternations.push(currentNFA);
			currentNFA = null;
		} else if (tok === "*" || tok === "?" || tok === "+") {
			currentNFA = quantify(currentNFA, tok, stateNum++);
		} else {
			let newNFA = new NFA("q" + stateNum++);
			newNFA.addAcceptState("q" + stateNum++);
			newNFA.addTransition("q" + (stateNum - 2), "q" + (stateNum - 1), tok);
			const nextToken = (tokens.length > 0 ? tokens[tokens.length - 1] : "");
			if (nextToken === "*" || nextToken === "?" || nextToken === "+") {
				newNFA = quantify(newNFA, tokens.pop(), stateNum++);
			}
			if (currentNFA === null) {
				currentNFA = newNFA;
			} else {
				currentNFA = concatenate(currentNFA, newNFA, stateNum++);
			}
		}
	}
	
	if (alternations.length > 0) {
		alternations.push(currentNFA);
		currentNFA = union(alternations, stateNum++);
	}
	
	return [currentNFA, tokens, stateNum];
}

function createDFA(regexString) {
	
}

function FiniteAutomata() {
	const stateContext = useContext(StateContext);
	
	let finiteAutomata = null;
	if (stateContext.finiteAutomataType === "GNFA") {
		finiteAutomata = createGNFA(stateContext.regex);
	} else if (stateContext.finiteAutomataType === "NFA") {
		[finiteAutomata, , ] = createNFA(stateContext.regex);
	} else if (stateContext.finiteAutomataType === "DFA") {
		finiteAutomata = createDFA(stateContext.regex);
	}
	
	if (finiteAutomata == null) { return <div />; }
	
	const transitions = finiteAutomata.transitions.map((transition) => (
		transition.from + " -> " + transition.to + " [label=\"" + transition.label + "\"]"
	)).join("\n");
	
	const dotString = `digraph finite_state_machine {
		fontname="Arial,Helvetica,sans-serif"
		node [fontname="Arial,Helvetica,sans-serif" penwidth=1.1]
		edge [fontname="Arial,Helvetica,sans-serif" arrowsize=0.8 arrowhead=vee penwidth=1.1]
		rankdir=LR
		
		s [shape=none style=invis]
		${finiteAutomata.startState} [shape=circle]
		s -> ${finiteAutomata.startState} [label=start]
		
		node [shape=doublecircle]
		${finiteAutomata.acceptStates.join(" ")}
		
		node [shape=circle]
		${transitions}
	}`;
	
	const vizOptions = {
		width: "95%",
		height:"100%",
		fit: true,
		zoom: false
	};
	
	return (
		<div>
			<div className={css.title}>Resulting {stateContext.finiteAutomataType}</div>
			<p>From regex: {stateContext.regex}</p>
			<Graphviz dot={dotString} options={vizOptions} />
		</div>
	);
}

export default FiniteAutomata;