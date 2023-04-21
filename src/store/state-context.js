import { createContext, useState } from "react";

const StateContext = createContext({
	regex: "",
	finiteAutomataType: "",
	updateData: (newData) => {}
});

export function StateContextProvider(props) {
	const [data, setData] = useState({
		regex: "",
		finiteAutomataType: ""
	});
	
	function updateDataHandler(newData) {
		setData(previousState => {
			return {
				...previousState,
				regex: newData.regex,
				finiteAutomataType: newData.finiteAutomataType
			}
		});
	}
	
	const context = {
		regex: data.regex,
		finiteAutomataType: data.finiteAutomataType,
		updateData: updateDataHandler
	}
	
	return <StateContext.Provider value={context}>{props.children}</StateContext.Provider>;
}

export default StateContext;