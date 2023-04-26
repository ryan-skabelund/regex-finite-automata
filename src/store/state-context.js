import { createContext, useState } from "react";

const StateContext = createContext({
	regex: "",
	finiteAutomataType: "",
	finiteAutomata: null,
	isSimulating: false,
	simTokens: [],
	step: "",
	currentNodes: [],
	currentTransitions: [],
	nextNodes: [],
	updateFiniteAutomata: (newData) => {},
	setIsSimulating: (isSimulating) => {},
	updateNodes: (isSimulating, simTokens, step, currentNodes, currentTransitions, nextNodes) => {}
});

export function StateContextProvider(props) {
	const [data, setData] = useState({
		regex: "",
		finiteAutomataType: "",
		finiteAutomata: null,
		isSimulating: false,
		simTokens: [],
		step: "",
		currentNodes: [],
		currentTransitions: [],
		nextNodes: []
	});
	
	function updateFiniteAutomataHandler(newData) {
		setData(previousState => {
			return {
				...previousState,
				regex: newData.regex,
				finiteAutomataType: newData.finiteAutomataType,
				finiteAutomata: newData.finiteAutomata,
				isSimulating: false,
				simTokens: [],
				step: "",
				currentNodes: [],
				currentTransitions: [],
				nextNodes: []
			}
		});
	}
	
	function setIsSimulatingHandler(isSimulating) {
		setData(previousState => {
			return {
				...previousState,
				isSimulating: isSimulating
			}
		})
	}
	
	function updateNodesHandler(isSimulating, simTokens, step, currentNodes, currentTransitions, nextNodes) {
		setData(previousState => {
			return {
				...previousState,
				isSimulating: isSimulating,
				simTokens: simTokens,
				step: step,
				currentNodes: currentNodes,
				currentTransitions: currentTransitions,
				nextNodes:  nextNodes
			}
		})
	}
	
	const context = {
		regex: data.regex,
		finiteAutomataType: data.finiteAutomataType,
		finiteAutomata: data.finiteAutomata,
		isSimulating: data.isSimulating,
		simTokens: data.simTokens,
		step: data.step,
		currentNodes: data.currentNodes,
		currentTransitions: data.currentTransitions,
		nextNodes: data.nextNodes,
		updateFiniteAutomata: updateFiniteAutomataHandler,
		setIsSimulating: setIsSimulatingHandler,
		updateNodes: updateNodesHandler
	}
	
	return <StateContext.Provider value={context}>{props.children}</StateContext.Provider>;
}

export default StateContext;