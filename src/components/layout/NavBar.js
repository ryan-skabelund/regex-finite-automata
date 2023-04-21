import css from "./NavBar.module.css";

function NavBar() {
	return (
		<header className={css.header}>
			<div className={css.title}>Regex to Finite Automata</div>
			<nav>
				<ul>
					<li>personal website</li>
					<li>Finite Automata to Regex</li>
				</ul>
			</nav>
		</header>
	);
}

export default NavBar;