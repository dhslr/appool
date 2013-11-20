(function () {
	"use strict";
	var _apps = {},
		apps = [],
		path = require("path"),
		fs = require("fs"),
		restify = require("restify"),
		utilities = require("utilities"),
		npmUtil = utilities.npm_util,
		pkgTransfer = utilities.pkg_transfer,
		update_apps, 
		install, remove, 
		http_server;
		
	http_server = restify.createServer({name: "appool"});

	update_apps = function (cb) {
		npmUtil.ls(function (updated_apps) {
			_apps = updated_apps;
			apps = [];
			for (var key in _apps) {
				if (_apps.hasOwnProperty(key)) {
					var val = _apps[key];
					apps.push({
						name: val.name,
						rule: val.rule,
						version: val.version
					});
				}
			}
			if (typeof cb === "function") {
				cb();
			}
		});
	};

	exports.listen = function (port, cb) {
		http_server.listen(port, function () {
			if (typeof cb !== "undefined") {
				update_apps(function () {
					cb(http_server.url);
				});
			}
		});
	};
	exports.close  = http_server.close;

	exports.address = function () {
		return http_server.address();
	};

	exports.getApps = function () {
		return _apps;
	};

	exports.getServer = function () {
		return http_server;
	};
	exports.setPrefix = npmUtil.setPrefix;
	
	exports.install = install = function (pkg_path, cb) {
		npmUtil.install(pkg_path, function (err, data) {
			var fdata;
			if (typeof cb === "function") {
				cb(err, data);
			}
			// copy pkg to module folder
			if (!err) {
				fdata = fs.readFileSync(pkg_path);
				fs.writeFile(path.join(data[data.length - 1][1], "pkg.tgz"), fdata, function (err) {
					if (!err) {
						fs.unlink(pkg_path);
					} else {
						console.log(err);
						throw err;
					}
				});
			}
		});
	};

	http_server.post("/apps/upload", pkgTransfer.handle_upload(function (err, data, res, next) {
		var fpath = "./app.tgz";
		if (err) {
			res.send(err);
		} else {
			fs.writeFile(fpath, data, function (err) {
				if (err) {
					//console.log(err);
					res.send(err);
				} else {
					install(fpath, function (err, idata) {
						if (err) {
							res.send(new restify.InvalidContentError("Could not install package!"));
						} else { 
							console.log(idata);
							update_apps(function () {
								res.send(201, {
									created: { path: "/apps/" + idata[idata.length - 1][0].split("@")[0]}
								});
							});
						}
					});
				}
			});
		}
		return next();
	}));

	http_server.get("/apps/:name/download", function (req, res, next) {
		var app = _apps[req.params.name];
		if (typeof app !== "undefined") {
			fs.readFile(path.join(app.realPath, "pkg.tgz"), function (err, data) {
				var disp;
				if (err) {
					res.send(err);
				} else {
					disp = "attachment; filename=" + app.name + "-" + app.version +".tgz";
					res.writeHead(200, {
						"Content-Length": data.length,
						"Content-Type": "application/x-tar",
						"Content-Encoding": "gzip",
						"Content-Disposition": disp
					});
					res.write(data);
					res.end();
				}
			});
		} else {
			res.send(new restify.ResourceNotFoundError("App " + req.params.name + " not found!")); 
		}
		return next();
	});
	http_server.get("/apps", function (req, res, next) {
		//update_apps();
		res.send(200, apps);
		return next();
	});
	remove = function (pkg_name, cb) {
		npmUtil.remove(pkg_name, function (err, data) {
			if (!err) {
				update_apps();
			}
			if (typeof cb === "function") {
				cb(err, data);
			}
		});
	};
	http_server.get("/apps/:name", function (req, res, next) {
		if (typeof _apps[req.params.name] === "undefined") {
			res.send(new restify.ResourceNotFoundError("App " + 
					req.params.name + "does not exist"));
		} else {
			for (var i = 0, l = apps.length; i < l; i ++) {
				var app = apps[i];
				if (app.name === req.params.name) {
					res.send(200, app);
					break;
				}
			}
		}
		return next();
	});
	http_server.del("/apps/:name", function (req, res, next) {
		remove(req.params.name, function (err) {
			if (err) {
				res.send(err);
			} else {
				// no content
				res.send(204);
			}
		});
		return next();
	});
})();
