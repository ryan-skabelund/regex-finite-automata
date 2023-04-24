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

// function getPowerSet(set) {
// 	const powerSet = [[]];
// 	for (const element of set) {
// 		const last = powerSet.length - 1;
// 		for (let i = 0; i <= last; i++) {
// 			powerSet.push([...powerSet[i], element]);
// 		}
// 	}
// 	return powerSet;
// }

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
		if (nfa === null) { return nfa; }
		
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
		
		function epsilonExpansion(state) {
			let transitionStates = new Set();
			if (state.constructor === Array) {
				for (const subState of state) {
					epsilonExpansion(subState).forEach((transitionState) => {
						transitionStates.add(transitionState);
					});
				}
			} else {
				transitionStates.add(state);
				if (NFATransitionTable[state] !== undefined && "ε" in NFATransitionTable[state]) {
					for (const subState of NFATransitionTable[state]["ε"]) {
						epsilonExpansion(subState).forEach((transitionState) => {
							transitionStates.add(transitionState);
						});
					}
				}
			}
			return transitionStates;
		}
		
		function doesKeyExist(dict, arrayKeyAsString) {
			let doesExist = false;
			arrayKeyAsString = arrayKeyAsString.split(",").sort().join(",");
			for (const [key, ] of Object.entries(dict)) {
				doesExist = (arrayKeyAsString === key.split(",").sort().join(","));
				if (doesExist) { break; }
			}
			return doesExist;
		}
		
		let dfa = new NFA();
		
		// Add alphabet
		for (const alphabetElement of nfa.alphabet) {
			if (alphabetElement !== "ε") {
				dfa.addToAlphabet(alphabetElement);
			}
		}
		
		// Add transitions
		let DFATransitionTable = {};
		
		let initialState = epsilonExpansion(nfa.startState);
		let statesToCheck = [initialState];
		while (statesToCheck.length > 0) {
			let currentState = statesToCheck.shift();
			for (const input of dfa.alphabet) {
				let transitionStates = new Set();
				for (const currentSubState of currentState) {
					if (NFATransitionTable[currentSubState] !== undefined && input in NFATransitionTable[currentSubState]) {
						epsilonExpansion(NFATransitionTable[currentSubState][input]).forEach((transitionState) => {
							transitionStates.add(transitionState);
						});
					}
				}
				
				if (transitionStates.size > 0) {
					const key = Array.from(currentState).join(",");
					if (!doesKeyExist(DFATransitionTable, key)) {
						DFATransitionTable[key] = {};
					}
					if (!(input in DFATransitionTable[key])) {
						DFATransitionTable[key][input] = Array.from(transitionStates).join(",");
						statesToCheck.push(transitionStates);
					}
				}
			}
		}
			
		function isAccepted(stateArrayAsString) {
			for (const state of stateArrayAsString.split(",")) {
				for (const acceptedState of nfa.acceptStates) {
					if (state === acceptedState) {
						return true;
					}
				}
			}
			return false;
		}
		
		// Simplify DFA by merging equivalent states
		// A state is considered equivalent if they have the same transition rules for all input symbols
		// as well as if they are either both accepted states or both not accepted states
		
		let mergedAcceptedStates = [];
		
		for (const [fromState1, inputs1] of Object.entries(DFATransitionTable)) {
			if (DFATransitionTable[fromState1] === undefined) { continue; }
			for (const [fromState2, inputs2] of Object.entries(DFATransitionTable)) {
				if (DFATransitionTable[fromState2] === undefined) { continue; }
				if (fromState1 === fromState2) { continue; }
				if (Object.keys(inputs1).length !== Object.keys(inputs2).length) { continue; }
				
				let areTransitionsEquivalent = true;
				for (const [input1, toState1] of Object.entries(inputs1)) {
					if (!(input1 in inputs2) || (isAccepted(fromState1) !== isAccepted(fromState2)) || (toState1 !== inputs2[input1] && (toState1 === undefined || inputs2[input1] === undefined)) || (toState1.split(",").sort().join(",") !== inputs2[input1].split(",").sort().join(","))) {
						areTransitionsEquivalent = false;
						break;
					}
				}
				if (areTransitionsEquivalent) {
					// Convert transitions to extra state to first state
					for (const [fromState3, inputs3] of Object.entries(DFATransitionTable)) {
						for (const [input3, toState3] of Object.entries(inputs3)) {
							if (toState3 !== undefined && toState3.split(",").sort().join(",") === fromState2.split(",").sort().join(",")) {
								DFATransitionTable[fromState3][input3] = fromState1;
							}
						}
					}
					// Check initial state
					if (Array.from(initialState).sort().join(",") === fromState2.split(",").sort().join(",")) {
						initialState = new Set(fromState1);
					}
					// Delete extra state
					delete DFATransitionTable[fromState2];
				}
			}
		}
		
		// Remap states
		stateNum = 0;
		
		let translatedStateNameCache = {};
		function translateStateName(originalState) {
			let modifiedOriginalState = originalState.split(",").sort().join(",");
			if (modifiedOriginalState in translatedStateNameCache) {
				return translatedStateNameCache[modifiedOriginalState];
			}
			const newState = "q" + stateNum++
			translatedStateNameCache[modifiedOriginalState] = newState;
			return newState;
		}
		
		function checkIfAcceptedAndAdd(stateArrayAsString) {
			if (mergedAcceptedStates.includes(stateArrayAsString)) {
				dfa.addAcceptState(translateStateName(stateArrayAsString));
				return;
			}
			for (const state of stateArrayAsString.split(",")) {
				for (const acceptedState of nfa.acceptStates) {
					if (state === acceptedState) {
						if (!(translateStateName(stateArrayAsString) in dfa.acceptStates)) {
							dfa.addAcceptState(translateStateName(stateArrayAsString));
						}
						return;
					}
				}
			}
		}
		
		dfa.setStartState(translateStateName(Array.from(initialState).join(",")));
		for (const [fromState, inputs] of Object.entries(DFATransitionTable)) {
			for (const [input, toState] of Object.entries(inputs)) {
				dfa.addTransition(translateStateName(fromState), translateStateName(toState), input);
				checkIfAcceptedAndAdd(toState);
			}
			checkIfAcceptedAndAdd(fromState);
		}
		
		// Add trap state
		let trapState = "q" + stateNum++;
		for (const [fromState, inputs] of Object.entries(DFATransitionTable)) {
			for (const alphabetElement of dfa.alphabet) {
				if (!Object.keys(inputs).includes(alphabetElement)) {
					dfa.addTransition(translateStateName(fromState), trapState, alphabetElement);
				}
			}
		}
		
		return dfa;
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
		width: "100%",
		height:"25rem",
		fit: true,
		zoom: false
	};
	
	return (
		<div>
			<div className={css.title}>Resulting {stateContext.finiteAutomataType}</div>
			<p>From regex: <em className={css.regex}>{stateContext.regex}</em></p>
			<Graphviz dot={dotString} options={vizOptions} className={css.dot} />
		</div>
	);
}

export default FiniteAutomata;