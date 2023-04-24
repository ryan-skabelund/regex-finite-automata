import { useContext } from "react";
import StateContext from "../store/state-context";

import css from "./MainPage.module.css";
import Partition from "../components/layout/Partition";
import InputRegex from "../components/partitions/InputRegex";
import FiniteAutomata from "../components/partitions/FiniteAutomata";

function MainPage() {
	const stateContext = useContext(StateContext); 
	
	if (stateContext.regex === "") {
		return (
			<div className={css.mainpage}>
				<Partition><InputRegex /></Partition>
			</div>
		);
	}
	
	return (
		<div className={css.mainpage}>
			<Partition><InputRegex /></Partition>
			<Partition><FiniteAutomata /></Partition>
		</div>
	);
}

export default MainPage;