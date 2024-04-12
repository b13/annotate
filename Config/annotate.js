const relExtPath = "../";
const relScssPath = `${relExtPath}/Resources/Private/Scss`;
const relCssPath = `${relExtPath}/Resources/Public/Css`;

module.exports = {
	scss: {
		path: {
			source: relScssPath,
			target: relCssPath,
		},
		// target (CSS) : source (SCSS)
		files: {
			[`${relCssPath}/main.css`]: `${relScssPath}/main.scss`,
		}
	}
};
