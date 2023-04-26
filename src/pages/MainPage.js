import { useContext } from "react";
import StateContext from "../store/state-context";

import css from "./MainPage.module.css";
import Partition from "../components/layout/Partition";
import InputRegex from "../components/partitions/InputRegex";
import ResultingFA from "../components/partitions/ResultingFA";
import Simulation from "../components/partitions/Simulation";

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
			<Partition><ResultingFA /></Partition>
			<Partition><Simulation /></Partition>
		</div>
	);
}

export default MainPage;