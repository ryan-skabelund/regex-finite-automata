import { useContext, useRef } from "react";
import StateContext from "../../store/state-context";

import css from "./Simulation.module.css";
import Button from "../ui/Button";

function Simulation() {
	const inputRef = useRef();
	const stateContext = useContext(StateContext);
	
	// const runSimulation = async() => {
	// 	let promise = new Promise((resolve, reject) => {
	// 		setTimeout(() => resolve("I am a done promise!"), 3000);
	// 	})
		
	// 	let result = await promise;
		
	// 	alert(result);
	// }
	
	const filteredAlphabet = stateContext.finiteAutomata.alphabet.filter((x) => x !== "ε");
	
	function onClickHandler() {
		let simulationInput = inputRef.current.value;
		let regex = new RegExp("^(" + filteredAlphabet.join("|") + ")*$", "gi");
		if (!simulationInput.match(regex)) {
			alert("Invalid input!");
			return;
		}
		
		if (!stateContext.isSimulating) {
			let currentNodes = [stateContext.finiteAutomata.startState];
			let currentTransitions =  ["s::" + stateContext.finiteAutomata.startState + "::start"];
			let nextNodes = [];
			stateContext.updateNodes(true, simulationInput.split(""), "Start", currentNodes, currentTransitions, nextNodes);
		} else {
			let newStep = "";
			
			if (stateContext.step === "Start") {
				newStep = (stateContext.finiteAutomata.type === "NFA" ? "Epsilon Expansion" : "Transition with input ");
			} else if (stateContext.step === "Epsilon Expansion") {
				newStep = "Set Epsilon Expansion States";
			} else if (stateContext.step === "Set Epsilon Expansion States") {
				newStep = "Transition with input ";
			} else if (stateContext.step.includes("Transition with")) {
				newStep = "Set States";
			} else if (stateContext.step === "Set States") {
				newStep = (stateContext.finiteAutomata.type === "NFA" ? "Epsilon Expansion" : "Transition with input ");
			}
			
			if (stateContext.currentNodes.length === 0) {
				let isAccepted = false;
				for (const state of stateContext.currentNodes) {
					isAccepted = stateContext.finiteAutomata.acceptStates.includes(state);
					if (isAccepted) { break; }
				}
				newStep = (isAccepted ? "Accepted" : "Rejected");
				stateContext.updateNodes(true, stateContext.simTokens, newStep, stateContext.currentNodes, [], []);
			}
			
			if (newStep === "Epsilon Expansion") {
				let currentNodes = stateContext.currentNodes;
				let currentTransitions =  [];
				let nextNodes = stateContext.finiteAutomata.epsilonExpansion(currentNodes);
				
				stateContext.finiteAutomata.transitions.forEach(transition => {
					if ((currentNodes.includes(transition.from) || (nextNodes.includes(transition.from) && transition.label.includes("ε"))) && nextNodes.includes(transition.to)) {
						currentTransitions.push(transition.from + "::" + transition.to + "::" + transition.label);
					}
				});
				
				stateContext.updateNodes(true, stateContext.simTokens, newStep, currentNodes, currentTransitions, nextNodes);
			} else if (newStep === "Transition with input ") {
				if (stateContext.simTokens.length > 0) {
					let input = stateContext.simTokens[0];
					let simTokens = stateContext.simTokens.slice(1);
					let currentNodes = stateContext.currentNodes;
					let currentTransitions =  [];
					let nextNodes = stateContext.finiteAutomata.getNextState(currentNodes, input, true);
					newStep += input;
					
					stateContext.finiteAutomata.transitions.forEach(transition => {
						if ((currentNodes.includes(transition.from) || (nextNodes.includes(transition.from) && transition.label.includes("ε"))) && nextNodes.includes(transition.to)) {
							currentTransitions.push(transition.from + "::" + transition.to + "::" + transition.label);
						}
					});
					
					stateContext.updateNodes(true, simTokens, newStep, currentNodes, currentTransitions, nextNodes);
				} else {
					let isAccepted = false;
					for (const state of stateContext.currentNodes) {
						isAccepted = stateContext.finiteAutomata.acceptStates.includes(state);
						if (isAccepted) { break; }
					}
					newStep = (isAccepted ? "Accepted" : "Rejected");
					stateContext.updateNodes(true, stateContext.simTokens, newStep, stateContext.currentNodes, [], []);
				}
			} else if (newStep === "Set States" || newStep === "Set Epsilon Expansion States") {
				let currentNodes = stateContext.nextNodes;
				let currentTransitions =  [];
				let nextNodes = [];
				stateContext.updateNodes(true, stateContext.simTokens, newStep, currentNodes, currentTransitions, nextNodes);
			}
		}
	}
	
	function resetHandler() {
		stateContext.updateNodes(false, [], "", [], [], []);
	}
	
	if (stateContext.isSimulating) {
		if (stateContext.step === "Accepted" || stateContext.step === "Rejected") {
			return (
				<div>
					<div className={css.title}>Simulate {stateContext.finiteAutomataType}</div>
					<label htmlFor="simulationInput">Enter an input according to the alphabet of the {stateContext.finiteAutomataType}: <em className={css.alphabet}>{"["}{filteredAlphabet.join(",")}{"]"}</em></label>
					<input disabled="true" className={css.input} type="text" ref={inputRef} id="simulationInput" name="simulationInput" spellCheck={false}></input>
					<div className={css.actions}>
						<Button caption="Reset Simulation" id="reset" onClick={resetHandler} />
						<Button caption="Next Step" id="next" disabled="true" onClick={onClickHandler} />
					</div>
					<div className={css.halt}>Input string was <strong className={css.strong}>{stateContext.step.toLowerCase()}{stateContext.step === "Accepted" ? "!" : ""}</strong></div>
				</div>
			);
		}
		return (
			<div>
				<div className={css.title}>Simulate {stateContext.finiteAutomataType}</div>
				<label htmlFor="simulationInput">Enter an input according to the alphabet of the {stateContext.finiteAutomataType}: <em className={css.alphabet}>{"["}{filteredAlphabet.join(",")}{"]"}</em></label>
				<input disabled="true" className={css.input} type="text" ref={inputRef} id="simulationInput" name="simulationInput" spellCheck={false}></input>
				<div className={css.actions}>
					<Button caption="Reset Simulation" id="reset" onClick={resetHandler} />
					<Button caption="Next Step" id="next" onClick={onClickHandler} />
				</div>
				<p>Current step: <em>{stateContext.step}</em></p>
				<div>Input remaining: <em className={css.alphabet}>{stateContext.simTokens.length > 0 ? stateContext.simTokens : ""}</em></div>
			</div>
		);
	}
	
	return (
		<div>
			<div className={css.title}>Simulate {stateContext.finiteAutomataType}</div>
			<label htmlFor="simulationInput">Enter an input according to the alphabet of the {stateContext.finiteAutomataType}: <em className={css.alphabet}>{"["}{filteredAlphabet.join(",")}{"]"}</em></label>
			<input className={css.input} type="text" ref={inputRef} id="simulationInput" name="simulationInput" spellCheck={false}></input>
			<div className={css.actions}>
				<Button caption="Simulate" id="Simulate" onClick={onClickHandler} />
			</div>
		</div>
	);
}

export default Simulation;