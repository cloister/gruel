/**
 * class: Thing
 * -----------------
 * deal with items and fixtures
 */
var Thing = (function() {
	"use strict";

	var _id = 0,				//unique id
			_type = '',			//'item' or 'fixture'
			_name = '',			//thing name (can be array of names)
			_desc = '',			//basic description
			_details = '',	//extra details when we have it in inventory
			_contents = [],	//things this thing contains
			_actions = {},	//actions that work on this thing
			_requires = [];	//anything required to access this thing

	//construct
	function Thing(id) {
		if (typeof id == 'undefined' || !id || id.length == 0) return;
		this.makeThingObject(id);
	};

	Thing.prototype.makeThingObject = function(id) {
		var json = gruel.adventure.things;
		if (typeof json == 'undefined') return;

		if (id) this._id = id;
		if (json[id].type) this._type = json[id].type;
		if (json[id].name) this._name = json[id].name;
		if (json[id].desc) this._desc = json[id].desc;
		if (json[id].details) this._details = json[id].details;
		if (json[id].contents) this._contents = json[id].contents;
		if (json[id].actions) this._actions = json[id].actions;
		if (json[id].requires) this._requires = json[id].requires;
	}

	/**
	 * takeAction()
	 * ----------------
	 * do something (action) with the current thing object
	 *
	 * returns:
	 * - true = good; no action should take place
	 * - "examine" = good; now look at the thing again
	 * - error message = bad
	 */
	Thing.prototype.takeAction = function(action) {
		var examine = 'examine', err = 'action_bad', new_id = 0;
		var action_id = this._actions[action];
		if (typeof action_id == 'undefined') return err;

		//could be an array if we're affecting something else
		//e.g. - pushing a button to open a box (gotta change the box state)
		if ($.isArray(action_id)) {
			//can't only change one thing into one other thing (that's 2 things)
			if (action_id.length != 2) return err;

			//okay, let's update the current object
			this.makeThingObject(action_id[0]);
			new_id = action_id[1];
		}
		else if ($.isNumeric(action_id)) {
			//single id
			new_id = action_id;
		}
		else {
			//it's not even an id? that's a terrible var name
			//must be a custom message string. let's display it
			gruel.msg.renderMsg(action_id);
			return true;
		}

		var new_thing = new Thing(new_id);
		var inv = new Inventory();

		//does this new thing require another item?
		var requires = new_thing.getRequires();

		if (requires.length) {
			if (!inv.isInInv(requires)) return 'action_requires';
		}

		//a couple situations into which we might run
		if (this._type == 'fixture') {
			//1) a fixture in the room
			this.swapItem(new_thing);
			return examine;
		}
		else if (this._type == 'item') {

			if (inv.isInInv(this._id)) {
				//2) in our inventory
				this.swapItem(new_thing, inv);
				return examine;
			}

			//3) an item we're not holding
			//gotta be holding it...
			err = 'action_not_held';
			return err;
		}

		return err;
	};

	/**
	 * takeActionWith()
	 * ----------------
	 * do something (action) with the current thing object
	 * in regards to another object
	 *
	 * - action = string
	 * - thing2 = object of the fixture
	 *
	 * returns true if we're cool
	 * returns error message if we're not cool
	 */
	Thing.prototype.takeActionWith = function(action, thing2) {
		var err = 'action_bad';

		var inv = new Inventory();
		if (inv.isInInv(this._id)) {

			if (action == 'put') {
				//put thing1 onto thing2
				thing2.addItemToContents(this._id);
				inv.dropItem(this._id);
				return true;
			}
			else if (action == 'use') {
				//default answer for now
				err = 'action_with_cannot_use';
			}
		}

		return err;
	};

	/**
	 * swapItem()
	 * --------------------
	 * we're taking an action, so that basically
	 * means we're swapping an item in one state
	 * for the same item in a different state (different ids)
	 */
	Thing.prototype.swapItem = function(new_thing, inv) {

		//Inventory swap
		if (inv) {

			//purge the old, busted thing
			inv.dropItem(this.getId());
			//add the new hotness
			inv.addItem(new_thing.getId());

		}
		//Location swap
		else {
			var loc = new Location();

			//fare thee well...
			loc.removeThing(this.getId());
			//why, hello there!
			loc.addThing(new_thing.getId());

		}
	};

	/**
	 * removeItemFromContents()
	 * ------------------------
	 * assumes we already have the thing object loaded for the container
	 * - item = id for thing we're removing
	 */
	Thing.prototype.removeItemFromContents = function(item) {
		if (!this || !this.hasContents()) return;

		//have to interact directory w/ the JSON here for it to work
		var contents = gruel.adventure.things[this._id].contents;
		var key = contents.indexOf(item);
		if (key >= 0) contents.splice(key, 1);
	};


	/**
	 * addItemToContents()
	 * ------------------------
	 * assumes we already have the thing object loaded for the container
	 * - item = id for thing we're adding
	 */
	Thing.prototype.addItemToContents = function(item) {
		if (!this) return;

		item = parseInt(item);

		//have to interact directory w/ the JSON here for it to work
		var contents = gruel.adventure.things[this._id].contents;
		if ($.inArray(item, contents) == -1) {
			contents.push(item);
		}
	};

	Thing.prototype.getId = function() {
		return this._id;
	};

	Thing.prototype.getType = function() {
		return this._type;
	};

	//returns string
	Thing.prototype.getName = function() {
		return this._name[0];
	};

	//returns array
	Thing.prototype.getAllNames = function() {
		return this._name;
	};

	Thing.prototype.getDesc = function() {
		return this._desc;
	};

	Thing.prototype.getDetails = function() {
		return this._details;
	};

	Thing.prototype.hasDetails = function() {
		return this._details && this._details.length > 0;
	};

	Thing.prototype.hasContents = function() {
		return this._contents && this._contents.length > 0;
	};

	Thing.prototype.getContentIds = function() {
		return this._contents && this._contents.length > 0 ? this._contents : '';
	};

	//output the display-ready contents
	Thing.prototype.getContentsHTML = function(items_only) {
		var contents = [], item = '';

		$.each(this._contents, function(i, id) {
			if (items_only == true && gruel.adventure.things[id].type != 'item') return true;
			item = gruel.adventure.things[id].name[0];
			contents.push(item);
		});

		contents = contents.join('<br />');
		return contents;
	};

	Thing.prototype.getActions = function() {
		return this._actions;
	};

	Thing.prototype.getRequires = function() {
		return this._requires;
	};

	// static
	// returns Thing object
	Thing.getContainerObjectById = function(item) {
		var container_id = 0;

		$.each(gruel.adventure.things, function(i, obj) {
			if ($.inArray(item, obj['contents']) >= 0) {
				container_id = i;
				return false;
			}
		});

		if (container_id) {
			var container = new Thing(container_id);
			return container;
		}

		return null;
	};

	return Thing;
}());