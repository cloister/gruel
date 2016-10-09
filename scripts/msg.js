(function($) {
	"use strict";
	window.gruel = window.gruel || {};
	window.gruel.msg = {
		$target: $('#words'),
		$cmd: $('#cmd_line'),
		url_dir: './msgs/',

		grabMsg: function(msg, vals, append) {
			//msg should be an array
			if (!$.isArray(msg)) msg = [msg];

			var json = gruel.adventure;
			$.each(msg, function(i,obj) {
				if (typeof json[obj] == 'undefined') return false;
				json = json[obj];
			});

			var txt = json;
			if (typeof txt == 'undefined') return '';

			this.renderMsg(txt, vals, append);
		},

		renderMsg: function(txt, vals, append) {
				if (!txt || txt.length == 0) return;

				//are we swapping anything out?
				if (vals && vals.length) {
					var v = '';

					$.each(vals, function(i, obj) {
						v = '$'+(i+1);
						if (txt.indexOf(v) >= 0) {
							txt = txt.replace(v, obj);
						}
					});
				}

				//done. show it.
				if (append) {
					this.$target.append('<br /><br />'+txt);
				}
				else {
					this.$target.html(txt);
				}

				this.$cmd.val('').focus();
		},

		appendMsg: function(msg, vals) {
			//vals should be an array
			if (!$.isArray(vals)) vals = [vals];
			this.grabMsg(msg, vals, true);
		},

		append: function(msg, vals) {
			//vals should be an array
			if (!$.isArray(vals)) vals = [vals];
			this.appendMsg(['main', msg], vals);
		},

		displayItems: function(items) {
			if (typeof items == 'undefined' || items.length == 0) return;

			this.append('you_see');

			var item = '';
			$.each(items, $.proxy(function(i, obj) {
				item = new Thing(obj);
				this.$target.append(item.getName()+'<br />');
			},this));
		},

		show: function(msg, vals) {
			//vals should be an array
			if (!$.isArray(vals)) vals = [vals];
			this.grabMsg(['main', msg], vals);
		},

		showInv: function(inv) {
			if (inv.length == 0) {
				this.show('inv_empty');
				return;
			}
			this.grabMsg(['main', 'inv'], [inv]);
		},

		isMsg: function(msg) {
			return typeof gruel.adventure.main[msg] != 'undefined';
		}
	}
}($));