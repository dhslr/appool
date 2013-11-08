#!/usr/bin/env node
(function () {
	"use strict";
	var apps_dir = process.argv[2] || "./appool_apps",
		url = require("url"),
		utilities = require("utilities"),
		discovery = utilities.discovery_provider.createDefaultProvider();
	require("fs").mkdir(apps_dir, function (err) {
		if (err) {
			console.log(err);
		}
		var port = process.argv[2] || 8079,
			appool = require("./appool.js");
		appool.setPrefix(apps_dir);
		appool.listen(port, function (uri) {
			var parsed = url.parse(uri);
			console.log("Appool listening on " + uri);
			discovery.createAdvertisement(Number(parsed.port), "appool"); 
			discovery.startAdvertising();
		});
	});
})();
