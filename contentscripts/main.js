(async () => {
	

	window.addEventListener("beforeunload", async function (e) {
		e.preventDefault();
		e.returnValue = "";
	});
})()