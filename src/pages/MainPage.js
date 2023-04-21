import css from "./MainPage.module.css";
import InputRegex from "../components/partitions/InputRegex";
import Partition from "../components/layout/Partition";

function MainPage() {
	function parseRegex(regex, finiteAutomataType) {
		console.log(regex + " -> " + finiteAutomataType);
	}
	
	return (
		<div className={css.mainpage}>
			<Partition>
				<InputRegex parseRegex={parseRegex}/>
			</Partition>
		</div>
	);
}

export default MainPage;