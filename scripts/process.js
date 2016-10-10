/**
 * PROCESS!
 * -------------------
 * the place where we process all that
 * great stuff that the user types in
 */
(function($) {
	"use strict";
	window.gruel = window.gruel || {};
	window.gruel.process = {
		url_cmd: './msgs/cmds.json',
		preposition_regex: /\s(in|on|with|under|from|to|for|at|by|as|into|onto|over|between|out|after|before)\s/,

		translate: function(cmd) {
			cmd = this.cleanUp(cmd);
			this.lookItUp(cmd);
		},

		cleanUp: function(words) {
			words = html_sanitize(words);
			words = words.toLowerCase();
			return words;
		},

		/**
		 * we can reasonably assume that the first word is a verb w/ nouns following
		 * Can handle:
		 * - [verb]
		 * - [verb] [noun]
		 * - [verb] [noun] [preposition] [noun]
		 */
		lookItUp: function(cmd) {
			var words = cmd.split(/ /);
			var verb = words[0];
			var nouns = cmd.replace(words[0],'').trim();

			//let's skip the whole "the" definite article
			nouns = nouns.replace(/the\s/,'');

			//"pick up" is all part of the verb <--hacky
			nouns = verb == 'pick' ? nouns.replace(/^up\s/,'') : nouns;

			//split where the preposition is
			nouns = nouns.replace(this.preposition_regex,',').split(/,/);

			this.processIt(verb, nouns)
		},

		processIt: function(verb, nouns) {
			//convert the nouns to an array if it's not already
			if (!$.isArray(nouns)) nouns = [nouns];

			//gotta have an adventure to have an adventure in...
			if (gAdventure == '' && verb != 'load') return;

			var the_func = gruel.adventure.commands[verb];

			if (the_func && typeof window["gruel"]["process"][the_func] != 'undefined') {
				//we know how to process this...
				window["gruel"]["process"][the_func](nouns);
			}
			else if (gruel.msg.isMsg(verb)) {
				//we've got a pat response for this one
				gruel.msg.show(verb);
			}
			else {
				//Huh?
				this.dunno();
			}
		},

		load: function(adventure) {
			gruel.adventure.load(adventure[0]);
		},

		save: function() {
			gruel.adventure.save();
		},

		getInv: function() {
			var inv = new Inventory();
			var items = inv.formatItemsAsHtml();
			gruel.msg.showInv(items);
		},

		look: function() {
			var loc = new Location();
			loc.look();
		},

		help: function() {
			gruel.msg.show('help');
		},

		go: function(dir) {
			if (dir.length > 0) {
				var func = gruel.adventure.commands[dir];
				if (typeof func != 'undefined') {
					window["gruel"]["process"][func]();
					return;
				}
			}

			//bad directions...
			gruel.msg.show('go_unknown');
		},

		goNorth: function() {
			gruel.action.goDir(0,1,0);
		},

		goNorthwest: function() {
			gruel.action.goDir(-1,1,0);
		},

		goNortheast: function() {
			gruel.action.goDir(1,1,0);
		},

		goSouth: function() {
			gruel.action.goDir(0,-1,0);
		},

		goSouthwest: function() {
			gruel.action.goDir(-1,-1,0);
		},

		goSoutheast: function() {
			gruel.action.goDir(1,-1,0);
		},

		goEast: function() {
			gruel.action.goDir(1,0,0);
		},

		goWest: function() {
			gruel.action.goDir(-1,0,0);
		},

		goUp: function() {
			gruel.action.goDir(0,0,1);
		},

		goDown: function() {
			gruel.action.goDir(0,0,-1);
		},

		getItem: function(item) {
			gruel.action.getDropItem('get',item[0]);
		},

		dropItem: function(item) {
			gruel.action.getDropItem('drop',item[0]);
		},

		examine: function(thing) {
			gruel.action.examine(thing[0]);
		},

		open: function(thing) {
			gruel.action.do('open',thing[0]);
		},

		close: function(thing) {
			gruel.action.do('close',thing[0]);
		},

		unlock: function(thing) {
			gruel.action.do('unlock',thing[0]);
		},

		lock: function(thing) {
			gruel.action.do('lock',thing[0]);
		},

		push: function(thing) {
			gruel.action.do('push',thing[0]);
		},

		pull: function(thing) {
			gruel.action.do('pull',thing[0]);
		},

		move: function(thing) {
			gruel.action.do('move',thing[0]);
		},

		put: function(things) {
			gruel.action.doWith('put',things);
		},

		use: function(things) {
			gruel.action.doWith('use',things);
		},

		rock: function(thing) {
			if (thing[0] == "out") {
				gruel.msg.show('rock_out');
			}
			else {
				gruel.msg.show('rock_unknown');
			}
		},

		// ¯\_(ツ)_/¯
		dunno: function() {
			gruel.msg.show('dunno');
		}
	}

}($));