const
	fs = require("fs")
	, sass = require('node-sass')
	, mkdirp = require('mkdirp')
	, path = require('path')
	, getDirName = require('path').dirname
	, postcss = require('postcss')
	, compressing = require('compressing')
	, config = require('./annotate');

(function() {
	function build(compress = false) {

		console.log("Build Scss started");
		console.log("------------");

		// make sure CSS public directory exists and is clean
		const cssPath = path.resolve(__dirname, config.scss.path.target);
		if (!fs.existsSync(cssPath)) {
			fs.mkdirSync(cssPath);
		}

		fs.readdirSync(cssPath).forEach((file) => {
			// don't remove critical css files
			if (!file.match(/critical-/g)) {
				fs.unlinkSync(path.resolve(__dirname, `${config.scss.path.target}/${file}`), (err) => {
					if (err) throw err;
				});
			}
		});

		function compileSass(options = {}) {

			// set default options
			options = Object.assign({
				style: 'expanded'
			}, options);

			// render the result
			const result = sass.renderSync({
				file: options.src,
				outputStyle: options.style
			});

			// post process the css files
			// see plugins and options: https://github.com/postcss/postcss
			postcss([
				require('autoprefixer')()
			]).process(result.css.toString()).then(result => {
					// write the result to file
				mkdirp(getDirName(options.dest), function (err) {
					if (err) return cb(err);
					fs.writeFile(options.dest, result.css, (error) => {
						if (error) {
							console.log(`Can't write file: ${options.dest} error: ${error}`);
						}
					});

					if (compress) {
						// add static gzip version
						compressing.gzip.compressFile(`${options.dest}`, `${options.dest}.gz`)
							.then(() => {
								console.log(' ' + path.basename(options.dest) + '.gz built.');
							})
							.catch(err => console.log(err));
					}

					// log successful compilation to terminal
					console.log(' ' + path.basename(options.dest) + ' built.');
				});
			});
		}

		for (const [dest, src] of Object.entries(config.scss.files)) {
			compileSass({
				src: path.resolve(__dirname, src),
				dest: path.resolve(__dirname, dest),
				style: 'compressed'
			});
		}

		console.log("------------");
		console.log("Build Scss finished");
	}

	return build();
})();

