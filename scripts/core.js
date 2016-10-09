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

// OUR ADVENTURE
var ADVENTURE = '';

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
		main_json_files: [
			'main',
			'commands',
			'adventures'
		],
		deferreds: [],
		me: 101,

		init: function() {
			this.loading(true);

			//load the rest of the javascript
			this.loadJS();

			//load all our JSON messages
			this.loadJSON();

			//when those are done, we may get this party started
			$.when.apply(null, this.deferreds).done($.proxy(function() {
				this.gruelIt();
			},this));
		},

		//our callback function for after the basic files are loaded
		gruelIt: function() {
			//get ready
			this.$cmd.val('').focus();

			//get set
			this.addHandlers();

			//starting from the beginning?
			/*if (localStorage.getItem(LOCATION) == '')*/ this.startFresh();

			//goodbye loading icon
			this.loading(false);

			//greeting message
			gruel.msg.show('welcome');

			//list possible adventures
			$.each(this.adventures, function(i, obj) {
				gruel.msg.append('adventure_list',obj.name+'<br />'+obj.desc);
			});
		},

		//our callback function to start the adventure
		begin: function() {
			//goodbye loading icon
			this.loading(false);

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

		load: function(adventure) {
			this.loading(true);

			//validate adventure
			var adv = gruel.adventure.adventures[adventure];
			if (typeof adv != 'object') {
				this.loading(false);
				gruel.msg.show('adventure_bad', [adventure]);
				return;
			}

			//set it
			ADVENTURE = adventure;

			//load our adventure JSON messages
			this.loadJSON(adv);

			//when those are done, we may get this party started
			$.when.apply(null, this.deferreds).done($.proxy(function() {
				this.begin();
			},this));
		},

		loading: function(load) {
			if (load === false) {
				$('#loading').hide().stop();
				this.$target.show();
			}
			else {
				this.$target.hide();
				$('#loading').show();
				this.loadingAnimation();
			}
		},

		loadingAnimation: function() {
			$('#loading').css('width', '0');
			$('#loading').animate({width:'50px'}, 800, gruel.adventure.loadingAnimation);
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
		loadJSON: function(adv) {
			var files = adv ? adv.files : this.main_json_files;

			$.each(files, $.proxy(function(i,filename) {
				var defer = $.Deferred();
				var dir = (adv) ? adv.dir : this.json_dir;
				var url = dir + filename + '.json';

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

	//let's get this party started
	gruel.adventure.init();

}($));