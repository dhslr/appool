(function () {
	"use strict";
	var appool = require("../appool.js"),
		restify = require("restify"),
		pkgTransfer = require("utilities").pkg_transfer,
		fs = require("fs"),
		util = require("util"),
		assert= require("assert"),
		pkg_path = "tests/pkgs/appA-0.0.0.tgz",
		path = require("path"),
		prefix = path.normalize("tests/blubb"),
		crypto = require("crypto"),
		compare;

		compare = function (fp1, fp2) {
			fs.readFile(fp1, function (err, data1) {
				var shasum1 = crypto.createHash("sha512"),
					shasum2 = crypto.createHash("sha512");
				if (err) {
					console.log(err);
					throw err;
				} else {
					var h1;
					shasum1.update(data1);
					h1 = shasum1.digest("base64");
					fs.readFile(fp2, function (err, data2) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							var h2;
							shasum2.update(data2);
							h2 = shasum2.digest("base64");
							assert.strictEqual(h1, h2);
							process.exit(1);
						}
					});
				}
			});
		};
		fs.mkdir(prefix, function (err) {
			if (err) {
				console.log(err);
				throw err;
			}
			fs.unlink(pkg_path + "_", function (err) {
			});
		appool.setPrefix(prefix);
		appool.listen(0, function (url) {
			var json_client = restify.createJsonClient({url: url, name: "test"});
			json_client.get("/apps", function (err, res, req, obj) {
				assert.ifError(err);
				assert.ok(obj);
				assert.ok(util.isArray(obj));
				assert.strictEqual(obj.length, 0);
			});

			pkgTransfer.upload(url, pkg_path, function (err, data) {
				if (err) {
					console.log(err);
					throw err;
				} else {
					setTimeout(function () {
						pkgTransfer.download(url, "appA", function (err, fn) {
							if (err) {
								console.log(err);
								throw err;
							} else {
								compare(pkg_path, fn);
							}
						});	
					}, 2000);
				}
			});
		});
	});
})();
