import { useContext } from "react";
import StateContext from "../../store/state-context";

import css from "./FiniteAutomata.module.css";
import { Graphviz } from "graphviz-react";

class NFA {
	constructor(startState) {
		this.states = [];
		this.alphabet = [];
		this.transitions = [];
		this.startState = startState;
		this.acceptStates = [];
	}
	
	addState(...args) {
		for (const newState of args) {
			if (!this.states.includes(newState)) {
				this.states.push(newState);
			}
		}
	}
	
	addToAlphabet(...args) {
		for (const newChar of args) {
			if (!this.alphabet.includes(newChar)) {
				this.alphabet.push(newChar);
			}
		}
	}
	
	addTransition(from, to, label) {
		this.transitions.push({
			from: from,
			to: to,
			label: label
		});
		this.addState(from, to);
		this.addToAlphabet(label);
	}
	
	setStartState(newStartState) {
		this.startState = newStartState;
		this.addState(newStartState);
	}
	
	addAcceptState(newAcceptState) {
		this.acceptStates.push(newAcceptState);
		this.addState(newAcceptState);
	}
}

function getPowerSet(set) {
	const powerSet = [[]];
	for (const element of set) {
		const last = powerSet.length - 1;
		for (let i = 0; i <= last; i++) {
			powerSet.push([...powerSet[i], element]);
		}
	}
	return powerSet;
}

function createFA(type, inputRegex) {
	var finiteAutomata = null;
	var stateNum = 0;
	var tokens = inputRegex.split(/(&.*?;)|/g).filter(n => n).reverse();
	
	if (type === "GNFA") {
		finiteAutomata = createGNFA();
	} else if (type === "NFA") {
		finiteAutomata = createNFA();
	} else if (type === "DFA") {
		finiteAutomata = createDFA();
	}
	
	//// OPERATIONS ////
	
	function concatenate(nfa1, nfa2) {
		let newNFA = new NFA(nfa1.startState);
		newNFA.states = nfa1.states.concat(nfa2.states);
		newNFA.alphabet = nfa1.alphabet.concat(nfa2.alphabet);
		newNFA.acceptStates = nfa2.acceptStates;
		newNFA.transitions = nfa1.transitions.concat(nfa2.transitions);
		nfa1.acceptStates.forEach(acceptState => {
			newNFA.addTransition(acceptState, nfa2.startState, "ε");
		});
		return newNFA;
	}
	
	function union(alternations) {
		const initialState = "q" + stateNum++;
		let newNFA = new NFA(initialState)
		alternations.forEach(nfa => {
			newNFA.states = newNFA.states.concat(nfa.states);
			newNFA.alphabet = newNFA.alphabet.concat(nfa.alphabet);
			newNFA.acceptStates = newNFA.acceptStates.concat(nfa.acceptStates);
			newNFA.transitions = newNFA.transitions.concat(nfa.transitions);
			newNFA.addTransition(initialState, nfa.startState, "ε");
		});
		return newNFA;
	}
	
	function quantify(nfa, quantifier) {
		const originalStartState = nfa.startState;
		if (quantifier === "*" || quantifier === "+") {
			nfa.acceptStates.forEach(acceptState => {
				nfa.addTransition(acceptState, originalStartState, "ε");
			});
		}
		if (quantifier === "*" || quantifier === "?") {
			const newStartState = "q" + stateNum++;
			nfa.addTransition(newStartState, originalStartState, "ε");
			nfa.setStartState(newStartState);
			nfa.addAcceptState(newStartState);
		}
		return nfa;
	}
	
	//// CONSTRUCTORS ////
	
	function createGNFA() {
		let gnfa = new NFA("q0");
		gnfa.addTransition("q0", "q1", tokens.reverse().join(""));
		gnfa.addAcceptState("q1");
		return gnfa;
	}
	
	function createNFA() {
		let alternations = [];
		let currentNFA = null;
		
		while (tokens.length > 0) {
			let tok = tokens.pop();
			if (tok === "(") {
				let subNFA = createNFA();
				const nextToken = (tokens.length > 0 ? tokens[tokens.length - 1] : "");
				if (nextToken === "*" || nextToken === "?" || nextToken === "+") {
					subNFA = quantify(subNFA, tokens.pop());
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
				currentNFA = quantify(currentNFA, tok);
			} else {
				let newNFA = new NFA("q" + stateNum++);
				newNFA.addTransition("q" + (stateNum - 1), "q" + (stateNum), tok);
				newNFA.addAcceptState("q" + stateNum++);
				const nextToken = (tokens.length > 0 ? tokens[tokens.length - 1] : "");
				if (nextToken === "*" || nextToken === "?" || nextToken === "+") {
					newNFA = quantify(newNFA, tokens.pop());
				}
				if (currentNFA === null) {
					currentNFA = newNFA;
				} else {
					currentNFA = concatenate(currentNFA, newNFA);
				}
			}
		}
		
		if (alternations.length > 0) {
			alternations.push(currentNFA);
			currentNFA = union(alternations);
		}
		
		return currentNFA;
	}
	
	function createDFA() {
		let nfa = createNFA();
		
		console.log(nfa.alphabet);
		console.log(nfa.states);
		
		// Populate NFA transition table
		let NFATransitionTable = {};
		for (const nfaState of nfa.states) {
			NFATransitionTable[nfaState] = {};
			for (const alphabetElement of nfa.alphabet) {
				NFATransitionTable[nfaState][alphabetElement] = [];
			}
		}
		for (const transition of nfa.transitions) {
			NFATransitionTable[transition.from][transition.label].push(transition.to);
		}
		
		console.log(NFATransitionTable);
		
		function epsilonExpansion(dfaState, input) {
			let transitionStates = [];
			if (dfaState.isArray) {
				for (const elem of dfaState) {
					transitionStates.push(epsilonExpansion(elem, input));
				}
			} else {
				if (input in NFATransitionTable[dfaState]) {
					transitionStates = transitionStates.concat(NFATransitionTable[dfaState][input]);
				}
				if ("ε" in NFATransitionTable[dfaState]) {
					transitionStates = transitionStates.concat(NFATransitionTable[dfaState]["ε"]);
				}
				transitionStates = transitionStates.filter(Boolean);
			}
			return transitionStates;
		}
		
		let dfa = new NFA();
		// Add states
		const powerSet = getPowerSet(nfa.states);
		dfa.addState(...powerSet);
		// Add alphabet
		for (const alphabetElement of nfa.alphabet) {
			if (alphabetElement !== "ε") {
				dfa.addToAlphabet(alphabetElement);
			}
		}
		// Add transitions
		let DFATransitionTable = {};
		for (const dfaState of dfa.states) {
			DFATransitionTable[dfaState] = {};
			for (const alphabetElement of dfa.alphabet) {
				
			}
		}
		
		console.log(epsilonExpansion("q1", "a"));
		
		return nfa;
	}
	
	return finiteAutomata;
}

function FiniteAutomata() {
	const stateContext = useContext(StateContext);
	
	let finiteAutomata = createFA(stateContext.finiteAutomataType, stateContext.regex);
	
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
		${finiteAutomata.startState} [shape=${finiteAutomata.acceptStates.includes(finiteAutomata.startState) ? "doublecircle " : "circle"}]
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