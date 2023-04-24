import css from "./Footer.module.css";

function Footer() {
	return (
		<footer className={css.footer}>
			<div className={css.stuff}>Created by Ryan Skabelund</div>
			<div className={css.stuff}>Check out my other projects <a href="https://ryan-skabelund.github.io" target="none">here</a></div>
		</footer>
	);
}

export default Footer;