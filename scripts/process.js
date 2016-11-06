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

			//let's skip the definite & indefinite articles
			nouns = nouns.replace(/\s(the|a|an)\s/,' ');

			//there's a chance that the 2nd word is part of the command
			//deal with it
			//(•_•)
			//( •_•)>⌐■-■
			//(⌐■_■)
			var second_cmd = nouns.match(/^(.+)\s/);
			if (second_cmd) {
				second_cmd = second_cmd[1];

				//"pick up" is all part of the verb <--hacky
				if (verb == 'pick' && second_cmd == 'up') {
					nouns = nouns.replace(/^up\s/,'');
				}

				//"look out" translates to "examine"
				if (verb == 'look' && second_cmd == 'out') {
					nouns = nouns.replace(/^out\s/,'');
					verb = 'examine';
				}
			}

			//split where the preposition is
			nouns = nouns.replace(this.preposition_regex,',').split(/,/);

			this.processIt(verb, nouns)
		},

		processIt: function(verb, nouns) {
			//convert the nouns to an array if it's not already
			if (!$.isArray(nouns)) nouns = [nouns];

			//gotta have an adventure to have an adventure in...
			if (gAdventure == '' && verb != 'load') return;

			//we might have a synonym for this verb...
			var the_func = gruel.adventure.commands[verb];

			if (typeof window["gruel"]["process"][verb] != 'undefined') {
				//literal function. do it.
				window["gruel"]["process"][verb](nouns);
			}
			else if (the_func && typeof window["gruel"]["process"][the_func] != 'undefined') {
				//synonym. we know how to process this...
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

		delete: function(adventure) {
			gruel.adventure.delete(adventure[0]);
		},

		inventory: function() {
			var inv = new Inventory();
			var items = inv.formatItemsAsHtml();
			gruel.msg.showInv(items);
		},

		look: function() {
			var loc = new Location();
			loc.look();
		},

		help: function(cmd) {
			gruel.help.showHelp(cmd[0]);
		},

		fullhelp: function() {
			gruel.help.showFullHelp();
		},

		go: function(dir) {
			if (dir.length > 0) {
				var func = gruel.adventure.commands[dir];
				if (typeof window["gruel"]["process"][dir] != 'undefined') {
					window["gruel"]["process"][dir]();
				}
				else if (typeof func != 'undefined') {
					window["gruel"]["process"][func]();
				}
				else {
					gruel.msg.show('go_unknown');
				}
				return;
			}

			//bad directions...
			gruel.msg.show('go_unknown');
		},

		north: function() {
			gruel.action.goDir(0,1,0);
		},

		northwest: function() {
			gruel.action.goDir(-1,1,0);
		},

		northeast: function() {
			gruel.action.goDir(1,1,0);
		},

		south: function() {
			gruel.action.goDir(0,-1,0);
		},

		southwest: function() {
			gruel.action.goDir(-1,-1,0);
		},

		southeast: function() {
			gruel.action.goDir(1,-1,0);
		},

		east: function() {
			gruel.action.goDir(1,0,0);
		},

		west: function() {
			gruel.action.goDir(-1,0,0);
		},

		up: function() {
			gruel.action.goDir(0,0,1);
		},

		down: function() {
			gruel.action.goDir(0,0,-1);
		},

		get: function(item) {
			gruel.action.getDropItem('get',item[0]);
		},

		drop: function(item) {
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

		climb: function(thing) {
			//Check to see if they are going up/down
			var dir = thing[0].match(/^(up|down)/);
			if (dir !== null) {
				this.go(dir[0].trim());
			}
			else {
				//let's assume it's an object (like a tree or a ladder)
				//we really just want a direction
				gruel.msg.show('climb_unknown');
			}
		},

		put: function(things) {
			gruel.action.doWith('put',things);
		},

		use: function(things) {
			gruel.action.doWith('use',things);
		},

		flip: function(thing) {
			gruel.action.do('flip',thing[0]);
		},

		break: function(thing) {
			gruel.action.do('break',thing[0]);
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