import css from "./MainPage.module.css";
import Partition from "../components/layout/Partition";
import InputRegex from "../components/partitions/InputRegex";
import FiniteAutomata from "../components/partitions/FiniteAutomata";

function MainPage() {
	return (
		<div className={css.mainpage}>
			<Partition><InputRegex /></Partition>
			<Partition><FiniteAutomata /></Partition>
		</div>
	);
}

export default MainPage;