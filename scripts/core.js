/**
 *      ___           ___           ___           ___           ___
 *     /\  \         /\  \         /\__\         /\  \         /\__\
 *    /::\  \       /::\  \       /:/  /        /::\  \       /:/  /
 *   /:/\:\  \     /:/\:\  \     /:/  /        /:/\:\  \     /:/  /
 *  /:/  \:\  \   /::\~\:\  \   /:/  /  ___   /::\~\:\  \   /:/  /
 * /:/__/_\:\__\ /:/\:\ \:\__\ /:/__/  /\__\ /:/\:\ \:\__\ /:/__/
 * \:\  /\ \/__/ \/_|::\/:/  / \:\  \ /:/  / \:\~\:\ \/__/ \:\  \
 *  \:\ \:\__\      |:|::/  /   \:\  /:/  /   \:\ \:\__\    \:\  \
 *   \:\/:/  /      |:|\/__/     \:\/:/  /     \:\ \/__/     \:\  \
 *    \::/  /       |:|  |        \::/  /       \:\__\        \:\__\
 *     \/__/         \|__|         \/__/         \/__/         \/__/
 *
 * gruel
 * a text adventure framework
 * by
 * scott cushman
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

// OUR LOCALSTORAGE CONSTANTS
var LOCATION = 'gruel_loc';
var INVENTORY = 'gruel_inv';

(function($) {
	"use strict";

	window.gruel = window.gruel || {};
	window.gruel.adventure = {
		$target: $('#words'),
		$cmd: $('#cmd_line'),
		js_dir: './scripts/',
		json_dir: './msgs/',
		starting_location: {x:0,y:0,z:0},
		js_files: [
			'actions',
			'html-sanitizer-minified',
			'inventory_class',
			'location_class',
			'msg',
			'process',
			'thing_class'
		],
		json_files: [
			'main',
			'commands',
			'locations',
			'things'
		],
		deferreds: [],
		me: 101,

		init: function() {
			//load the rest of the javascript
			this.loadJS();

			//load all our JSON messages
			this.loadJSON();

			//when those are done, we may get this party started
			$.when.apply(null, this.deferreds).done($.proxy(function() {
				this.begin();
			},this));
		},

		//our callback function to kick off the adventure
		//after the necessary files have been loaded
		begin: function() {
			//get ready
			this.$cmd.val('').focus();

			//get set
			this.addHandlers();

			//starting from the beginning?
			/*if (localStorage.getItem(LOCATION) == '')*/ this.startFresh();

			//goodbye loading icon
			this.$target.removeClass('loading');

			//go!
			gruel.process.look();
		},

		startFresh: function() {
			//start at the beginning with nothing
			localStorage.setItem(LOCATION, JSON.stringify(this.starting_location));
			localStorage.setItem(INVENTORY, '');
		},

		addHandlers: function() {
			this.$cmd.on('keypress', function(e) {
				var key = e.which;
				//enter key action!
				if (key == 13) {
					gruel.process.translate($(this).val());
				}
			});
		},

		loadJS: function() {
			$.each(this.js_files, $.proxy(function(i,filename) {
				var url = this.js_dir + filename + '.js';
				var defer = $.Deferred();

				$.getScript(url, function() {
					defer.resolve();
				});

				this.deferreds.push(defer);
			},this));
		},

		/**
		 * load all the JSON files into gruel.adventure.data
		 * so we can access it as an object
		 */
		loadJSON: function() {

			$.each(this.json_files, $.proxy(function(i,filename) {
				var defer = $.Deferred();
				var url = this.json_dir + filename + '.json';

				$.ajax({
					url: url,
					dataType: "json",
					beforeSend: function(xhr) {
						//fixes a "not well-formed" err in FF
						xhr.overrideMimeType( "application/json" );
					}
				})
				.done($.proxy(function(res) {
					this[filename] = res[filename];
					defer.resolve();
				},this))
				.fail(function(res) {
					console.log("error");
					console.log(res);
				});

				this.deferreds.push(defer);
			},this));
		}
	}

	//let the adventure BEGIN!!!
	gruel.adventure.init();

}($));