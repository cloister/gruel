/**
 * HELP!
 * ---------------------
 * Our helper function for helpful help
 */
(function($) {
	"use strict";
	window.gruel = window.gruel || {};
	window.gruel.help = {

		/**
		 * showHelp()
		 * ----------------
		 * user typed "help" or "help [command]"
		 */
		showHelp: function(cmd) {
			if (cmd == '') {
				//basic help msg
				gruel.msg.grabMsg(['help','basic_help']);
			}
			else {
				//help about s specific command
				//1 - translate it if it's an alias
				var the_func = gruel.adventure.commands[cmd];
				cmd = the_func ? the_func : cmd;

				//2 - grab the specific help msg
				if (cmd && typeof gruel.adventure.help[cmd] != 'undefined') {
					var help_msg = this.formatHelp(cmd);
					gruel.msg.renderMsg(help_msg);
				}
				else {
					gruel.process.dunno();
				}
			}
		},

		/**
		 * formatHelp()
		 * ---------------
		 * custom format of the help message display
		 */
		formatHelp: function(cmd) {
			if (cmd == '') return;

			//check for aliases
			var akas = [];
			$.each(gruel.adventure.commands, function(alias,verb) {
				if (cmd == verb) akas.push(alias);
			});

			//add aliases
			var aka = akas.length ? ' / '+akas.join(' / ') : '';

			//put together the full help message
			var msg = '<b>'+ cmd + aka +'</b><br />'+
								gruel.adventure.help[cmd];

			return msg;
		},

		/**
		 * showFullHelp()
		 * ----------------
		 * user typed "fullhelp"
		 * get a list of all our commands and format them
		 */
		showFullHelp: function() {
			var msg = '';

			//go through all our commands for which we have help info
			$.each(gruel.adventure.help, $.proxy(function(cmd,desc) {
				if (cmd == 'basic_help') return true; //skip
				var help_msg = this.formatHelp(cmd);
				if (help_msg) msg += help_msg+'<br /><br />';
			},this));

			//show all that help
			gruel.msg.renderMsg(msg);
		}
	}

}($));