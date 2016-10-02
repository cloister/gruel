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
		 * we can reasonably assume that the first word is a verb
		 * and anything after that is a noun
		 */
		lookItUp: function(cmd) {
			var words = cmd.split(/ /);
			var verb = words[0];
			var noun = cmd.replace(words[0],'').trim();

			//let's skip the whole "the" definite article
			noun = noun.replace(/the /,'');

			//"pick up" is all part of the verb <--hacky
			noun = verb == 'pick' ? noun.replace(/up /,'') : noun;

			this.processIt(verb, noun)
		},

		processIt: function(verb, noun) {
			var the_func = gruel.adventure.commands[verb];

			if (the_func && typeof window["gruel"]["process"][the_func] != 'undefined') {
				//we know how to process this...
				window["gruel"]["process"][the_func](noun);
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
			gruel.action.getDropItem('get',item);
		},

		dropItem: function(item) {
			gruel.action.getDropItem('drop',item);
		},

		examine: function(thing) {
			gruel.action.examine(thing);
		},

		open: function(thing) {
			gruel.action.do('open',thing);
		},

		close: function(thing) {
			gruel.action.do('close',thing);
		},

		unlock: function(thing) {
			gruel.action.do('unlock',thing);
		},

		lock: function(thing) {
			gruel.action.do('lock',thing);
		},

		push: function(thing) {
			gruel.action.do('push',thing);
		},

		pull: function(thing) {
			gruel.action.do('pull',thing);
		},

		move: function(thing) {
			gruel.action.do('move',thing);
		},

		rock: function(thing) {
			if (thing == "out") {
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