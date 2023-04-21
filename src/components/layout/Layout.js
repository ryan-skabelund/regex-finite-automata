import NavBar from "./NavBar";
	
function Layout(props) {
	return (
		<div>
			<NavBar />
			<main>{props.children}</main>
			{/* Footer */}
		</div>
	);
}

export default Layout;