// Finite Automata class
class FA {
	constructor(startState, type) {
		this.type = type;
		this.states = [];
		this.alphabet = [];
		this.transitions = [];
		this.transitionTable = {};
		this.startState = startState;
		this.acceptStates = [];
	}
	
	#addState(...newStates) {
		for (const newState of newStates) {
			if (!this.states.includes(newState)) {
				this.states.push(newState);
				this.transitionTable[newState] = {};
				for (const input of this.alphabet) {
					if ((this.type === "DFA" && input !== "") || this.type !== "DFA") {
						this.transitionTable[newState][input] = [];
					}
				}
			}
		}
	}
	
	// Simplify DFA by merging equivalent states
	// A state is considered equivalent if they have the same transition rules for all input symbols
	// as well as if they are either both accepted states or both not accepted states
	mergeEquivalentStates() {
		if (this.type !== "DFA") { return; }
		for (const [fromState1, inputs1] of Object.entries(this.transitionTable)) {
			if (this.transitionTable[fromState1] === undefined) { continue; }
			for (const [fromState2, inputs2] of Object.entries(this.transitionTable)) {
				if (this.transitionTable[fromState2] === undefined) { continue; }
				if (fromState1 === fromState2) { continue; }
				if (Object.keys(inputs1).length !== Object.keys(inputs2).length) { continue; }
				// Get if states are equivalent
				let areStatesEquivalent = true;
				for (const [input1, toState1] of Object.entries(inputs1)) {
					if (!(input1 in inputs2) || toState1 !== inputs2[input1] || (this.acceptStates.includes(fromState1) !== this.acceptStates.includes(fromState2))) {
						areStatesEquivalent = false;
						break;
					}
				}
				if (areStatesEquivalent) {
					this.states = this.states.filter(x => x !== fromState2);
					this.acceptStates = this.acceptStates.filter(x => x !== fromState2);
					// Check start state
					if (this.startState === fromState2) {
						this.setStartState(fromState1);
					}
					// Convert transitions to extra state to first state
					for (const [fromState3, inputs3] of Object.entries(this.transitionTable)) {
						for (const [input3, toState3] of Object.entries(inputs3)) {
							if (toState3 === fromState2) {
								this.transitionTable[fromState3][input3] = fromState1;
							}
						}
					}
					// Do the same for the transition list
					let newTransitions = [];
					this.transitions.forEach(transition => {
						if (transition.to === fromState2) {
							newTransitions.push({
								from: transition.from,
								to: fromState1,
								label: transition.label
							});
						} else if (transition.from !== fromState2) {
							newTransitions.push(transition);
						}
					});
					this.transitions = newTransitions;
					// Delete extra state
					delete this.transitionTable[fromState2];
				}
			}
		}
		this.#remapStates();
	}
	
	#remapStates() {
		let stateNum = 0;
		let mappedStates = {};
		this.states.forEach(state => {
			mappedStates[state] = "q" + stateNum++;
		});
		this.states = Object.values(mappedStates);
		this.startState = mappedStates[this.startState];
		this.acceptStates = this.acceptStates.map(acceptState => mappedStates[acceptState]);
		this.transitions = this.transitions.map(transition => {
			return {
				from: mappedStates[transition.from],
				to: mappedStates[transition.to],
				label: transition.label
			}
		});
		let newTransitionTable = {};
		for (const [fromState, inputs] of Object.entries(this.transitionTable)) {
			newTransitionTable[mappedStates[fromState]] = {}
			for (const [input, toState] of Object.entries(inputs)) {
				newTransitionTable[mappedStates[fromState]][input] = mappedStates[toState];
			}
		}
		delete this.transitionTable;
		this.transitionTable = newTransitionTable;
	}
	
	#addToAlphabet(...newInputs) {
		for (const newInput of newInputs) {
			if (!this.alphabet.includes(newInput)) {
				this.alphabet.push(newInput);
				this.alphabet = this.alphabet.sort();
				if ((this.type === "DFA" && newInput !== "") || this.type !== "DFA") {
					for (const fromState of Object.keys(this.transitionTable)) {
							this.transitionTable[fromState][newInput] = [];
						}
					}
			}
		}
	}
	
	addTransition(from, to, input) {
		this.#addState(from, to);
		this.#addToAlphabet(input);
		
		if (this.type === "NFA") {
			this.transitionTable[from][input].push(to);
		} else if (this.type === "DFA") {
			this.transitionTable[from][input] = to;
		}
		
		this.transitions.push({
			from: from,
			to: to,
			label: input
		});
	}
	
	epsilonExpansion(state) {
		let transitionStates = new Set();
		if (state.constructor === Array) {
			for (const subState of state) {
				this.epsilonExpansion(subState).forEach((transitionState) => {
					transitionStates.add(transitionState);
				});
			}
		} else if (this.states.includes(state)) {
			transitionStates.add(state);
			if (this.transitionTable[state] !== undefined && "ε" in this.transitionTable[state]) {
				for (const subState of this.transitionTable[state]["ε"]) {
					this.epsilonExpansion(subState).forEach((transitionState) => {
						transitionStates.add(transitionState);
					});
				}
			}
		}
		return Array.from(transitionStates);
	}
	
	getNextState(fromState, input, noEpsilonExpansion=false) {
		let transitionStates = new Set();
		if (fromState.constructor === Array || fromState.constructor === Set) {
			for (const fromSubState of fromState) {
				this.getNextState(fromSubState, input, noEpsilonExpansion).forEach((transitionState) => {
					transitionStates.add(transitionState);
				});
			}
		} else if (this.states.includes(fromState)) {
			if (this.type === "NFA") {
				this.epsilonExpansion(fromState).forEach((expandedState) => {
					if (this.transitionTable[expandedState] !== undefined && input in this.transitionTable[expandedState]) {
						if (noEpsilonExpansion) {
							this.transitionTable[expandedState][input].forEach((transitionState) => transitionStates.add(transitionState));
						} else {
							this.epsilonExpansion(this.transitionTable[expandedState][input]).forEach((transitionState) => transitionStates.add(transitionState));
						}
					}
				});
			} else if (this.type ==="DFA") {
				if (this.transitionTable[fromState] !== undefined && input in this.transitionTable[fromState]) {
					transitionStates.add(this.transitionTable[fromState][input])
				}
			}
		}
		return Array.from(transitionStates);
	}
	
	simplifyTransitions() {
		let newTransitions = [];
		for (const fromState of this.states) {
			for (const toState of this.states) {
				let labels = [];
				for (const transition of this.transitions) {
					if (transition.from === fromState && transition.to === toState) {
						labels.push(transition.label);
					}
				}
				if (labels.length > 0) {
					newTransitions.push({
						from: fromState,
						to: toState,
						label: labels.sort().join(",")
					});
				}
			}
		}
		this.transitions = newTransitions;
	}
	
	setStartState(newStartState) {
		this.startState = newStartState;
		this.#addState(newStartState);
	}
	
	addAcceptState(newAcceptState) {
		if (!(this.acceptStates.includes(newAcceptState))) {
			this.acceptStates.push(newAcceptState);
			this.#addState(newAcceptState);
		}
	}
}

// Generic function to create a finite automata
function createFA(type, inputRegex) {
	var finiteAutomata = null;
	var stateNum = 0;
	var tokens = inputRegex.split(/(&.*?;)|/g).filter(n => n).reverse();
	
	if (type === "NFA") {
		finiteAutomata = createNFA();
	} else if (type === "DFA") {
		finiteAutomata = createDFA();
	}
	
	//// CREATE NFA ////
	
	function concatenate(nfa1, nfa2) {
		let newNFA = new FA(nfa1.startState, nfa1.type);
		for (const [fromState, inputs] of Object.entries(nfa1.transitionTable)) {
			for (const [input, toStates] of Object.entries(inputs)) {
				toStates.forEach(toState => newNFA.addTransition(fromState, toState, input));
			}
		}
		for (const [fromState, inputs] of Object.entries(nfa2.transitionTable)) {
			for (const [input, toStates] of Object.entries(inputs)) {
				toStates.forEach(toState => newNFA.addTransition(fromState, toState, input));
			}
		}
		newNFA.acceptStates = nfa2.acceptStates;
		nfa1.acceptStates.forEach(acceptState => {
			newNFA.addTransition(acceptState, nfa2.startState, "ε");
		});
		return newNFA;
	}
	
	function union(alternations) {
		const initialState = "q" + stateNum++;
		let newNFA = new FA(initialState, alternations[0].type)
		alternations.forEach(nfa => {
			for (const [fromState, inputs] of Object.entries(nfa.transitionTable)) {
				for (const [input, toStates] of Object.entries(inputs)) {
					toStates.forEach(toState => newNFA.addTransition(fromState, toState, input));
				}
			}
			newNFA.acceptStates = newNFA.acceptStates.concat(nfa.acceptStates);
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
	
	function createNFA() {
		let alternations = [];
		let currentNFA = null;
		
		// Iterate until tokens are exhausted
		while (tokens.length > 0) {
			let tok = tokens.pop();
			// Opening parenthesis, treat as new sub-NFA
			if (tok === "(") {
				let subNFA = createNFA();
				const nextToken = (tokens.length > 0 ? tokens[tokens.length - 1] : "");
				if (nextToken === "*" || nextToken === "?" || nextToken === "+") {
					subNFA = quantify(subNFA, tokens.pop());
				}
				currentNFA = (currentNFA === null ? subNFA : concatenate(currentNFA, subNFA));
			// Close parenthesis, scope back up
			} else if (tok === ")") {
				break;
			// Alternation operator, add NFA to alternation list
			} else if (tok === "|") {
				alternations.push(currentNFA);
				currentNFA = null;
			// Quantifier, adjust NFA
			} else if (tok === "*" || tok === "?" || tok === "+") {
				currentNFA = quantify(currentNFA, tok);
			// Else concat NFA with next token
			} else {
				let newNFA = new FA("q" + stateNum++, "NFA");
				newNFA.addTransition("q" + (stateNum - 1), "q" + (stateNum), tok);
				newNFA.addAcceptState("q" + stateNum++);
				const nextToken = (tokens.length > 0 ? tokens[tokens.length - 1] : "");
				if (nextToken === "*" || nextToken === "?" || nextToken === "+") {
					newNFA = quantify(newNFA, tokens.pop());
				}
				currentNFA = (currentNFA === null ? newNFA : concatenate(currentNFA, newNFA));
			}
		}
		// If alternation exists, union them
		if (alternations.length > 0) {
			alternations.push(currentNFA);
			currentNFA = union(alternations);
		}
		
		return currentNFA;
	}
	
	/// CREATE DFA ///
	
	function createDFA() {
		// Start by creating an NFA
		let nfa = createNFA();
		if (nfa === null) { return nfa; }
		
		let dfa = new FA(null, "DFA");
		stateNum = 0;
		
		let translatedStateNameCache = {};
		function translateStateName(originalStateArray) {
			let modifiedOriginalState = originalStateArray.sort().join(",");
			if (modifiedOriginalState in translatedStateNameCache) {
				return translatedStateNameCache[modifiedOriginalState];
			}
			const newState = "q" + stateNum++
			translatedStateNameCache[modifiedOriginalState] = newState;
			return newState;
		}
		
		function isAccepted(stateArray) {
			for (const state of stateArray) {
				if (nfa.acceptStates.includes(state)) {
					return true;
				}
			}
			return false;
		}
		
		let expandedStartState = nfa.epsilonExpansion(nfa.startState);
		dfa.setStartState(translateStateName(expandedStartState));
		
		let statesToCheck = [expandedStartState];
		let checkedStates = [];
		while (statesToCheck.length > 0) {
			let currentState = statesToCheck.shift();
			if (checkedStates.includes(currentState.sort().join(","))) { continue; }
			for (const input of nfa.alphabet.filter(x => x !== "ε")) {
				let transitionStates = nfa.getNextState(currentState, input);
				// Each currentState (equivalent to multiple states of the NFA) must have transitions for all elements of the alphabet
				// If a transition does not exist, then we create one directed towards a trap state
				if (transitionStates.length === 0) {
					transitionStates.push("qtrap");
				}
				dfa.addTransition(translateStateName(currentState), translateStateName(transitionStates), input);
				if (isAccepted(currentState)) {
					dfa.addAcceptState(translateStateName(currentState));
				}
				statesToCheck.push(transitionStates);
			}
			checkedStates.push(currentState.sort().join(","));
		}
		
		dfa.mergeEquivalentStates();
		dfa.simplifyTransitions();
		
		return dfa;
	}
	
	return finiteAutomata;
}

export default createFA;