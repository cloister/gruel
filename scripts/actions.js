/**
 * ACTIONS!
 * ---------------------
 * A place where we actually deal with the
 * crazy stuff the user asks to do
 */
(function($) {
	"use strict";
	window.gruel = window.gruel || {};
	window.gruel.action = {

		//go somewhere (n,s,e,w)
		goDir: function(x,y,z) {
			var loc = new Location();
			var res = loc.updateLocation(x,y,z);

			if (res) {
				//take a gander...
				gruel.process.look();
			}
			else {
				gruel.msg.show('nogo');
			}
		},

		/**
		 * findThatThing()
		 * -------------------
		 * helper function for something we do a lot here
		 * - grab all the items with which we can interact
		 * - then cycle through to grab the object we need
		 */
		findThatThing: function(thing) {
			var thing_obj = null;

			//get ALL! THE! THINGS!
			//1) all the items & fixtures at our location
			var loc = new Location();
			var things = loc.getLocalThings();

			//2) all the items in our inventory
			var inv = new Inventory();
			things = things.concat(inv.items());

			//3) any items those things contain
			var contents, a_thing = null;
			$.each(things, function(i, id) {
				a_thing = new Thing(id);
				contents = a_thing.getContentIds();
				if (contents)	things = things.concat(contents);
			});

			//now that we have all possible things...
			//is our desired thing in that list?
			if (things.length) {
				$.each(things, function(i, id) {

					thing_obj = new Thing(id);
					if (thing_obj && thing_obj.getAllNames().indexOf(thing) >= 0) return false;

					thing_obj = null;
				});
			}

			return thing_obj;
		},

		//we can examine items and fixtures and stuff in our inventory
		examine: function(thing) {
			var desc = '';

			var thing_obj = this.findThatThing(thing);

			//examination time!
			if (thing_obj) {
				desc = thing_obj.getDesc();

				//if we're holding it, we get details too!
				var inv = new Inventory();
				if (inv.isInInv(thing_obj.getId()) && thing_obj.hasDetails()) {
					desc += '<br />'+thing_obj.getDetails();
				}

				//does it contain anything?
				if (thing_obj.hasContents()) {
					desc += '<br /><br />'+gruel.adventure.main.contains+thing_obj.getContentsHTML();
				}
			}

			if (desc != '') {
				gruel.msg.show('examine', [desc]);
			}
			else {
				gruel.msg.show('examine_nothing');
			}
		},

		//get an item, leave an item...
		getDropItem: function(action, item) {
			var res = false;

			var thing_obj = this.findThatThing(item);

			if (thing_obj && thing_obj.getType() == 'item') {
				var id = thing_obj.getId();
				var inv = new Inventory();
				res = action == 'get' ? inv.pickUp(id) : inv.dropIt(id);
			}

			if (res) {
				//oh, that just happened
				gruel.msg.show(action+'_done',[thing_obj.getName()]);
			}
			else {
				//uh...nope
				gruel.msg.show(action+'_unknown');
			}
		},

		/**
		 * do()
		 * -------------------
		 * general function to take an action
		 * on an item or fixture
		 */
		do: function(action, thing) {
			var res = false;

			var thing_obj = this.findThatThing(thing);

			//let's make this happen
			res = (thing_obj) ? thing_obj.takeAction(action) : 'action_unknown';

			if (res === true) {
				//let us re-examine this thing...
				this.examine(thing);
			}
			else {
				//uh...nope
				gruel.msg.show(res, [action, thing]);
			}
		}

	}

}($));