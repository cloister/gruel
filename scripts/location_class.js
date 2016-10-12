var Location = (function() {
	"use strict";

	var _here = '',			//coordinates of where we are ("0,0,0")
			_name = '',			//location NAME
			_desc = '',			//location description
			_things = [],		//all those items and fixtures one can find here
			_requires = [];	//anything that we require to get to here

	//construct
	function Location() {
		//grab our current location, items, & fixtures
		this.setLocalData();
	};

	/**
	 * setLocalData()
	 * ----------------
	 * get the current location from localStorage
	 */
	Location.prototype.setLocalData = function() {
		var json = gruel.adventure.locations;

		this._here = this.formatCoords(gLocation);
		this._name = json[this._here].name;
		this._desc = json[this._here].desc;
		this._things = this.getVisible();
		this._requires = this.getRequires();
	};

	Location.prototype.here = function() {
		return this._here;
	};

	Location.prototype.getName = function() {
		return this._name;
	};

	Location.prototype.getDesc = function() {
		return this._desc;
	};

	Location.prototype.getLocalThings = function() {
		return this._things;
	};

	Location.prototype.getRequires = function() {
		return this._requires;
	};

	Location.prototype.formatCoords = function(pos) {
		try {
			pos = JSON.parse(pos);
		}
		catch (e) {
			//well, we tried...
		}

		var coords = pos.x+','+pos.y+','+pos.z;
		return coords;
	};

	Location.prototype.look = function() {
		//show name
		gruel.msg.grabMsg(['locations', this._here,'name']);
		//show the description
		gruel.msg.grabMsg(['locations', this._here,'desc'], '', true);
		//show any items that are here
		this.showItems();
	};

	Location.prototype.updateLocation = function(x,y,z) {
		//set new position
		var pos = {};
		pos.x = gLocation.x + parseInt(x);
		pos.y = gLocation.y + parseInt(y);
		pos.z = gLocation.z + parseInt(z);

		var coords = this.formatCoords(pos);

		//are we in a good place?
		if (typeof gruel.adventure.locations[coords] == 'undefined') return false;

		//do we have the requirements?
		if (!this.hasRequirementsFor(coords)) return false;

		//set the new location
		gLocation = pos;

		//update object
		this.setLocalData();

		return true;
	};

	Location.prototype.hasRequirementsFor = function(new_coords) {
		var requires = gruel.adventure.locations[new_coords].requires;
		if (requires.length == 0) return true;

		var things = this.getVisible();
		var res = false;

		$.each(requires, function(i, id) {
			if (things.indexOf(id) >= 0) {
				res = true;
				return false;
			}
		});

		return res;
	};

	Location.prototype.showItems = function() {
		gruel.msg.displayItems(this.getVisibleItems());
	};

	/**
	 * isItemHere()
	 * ------------------
	 * gotta check all visible items
	 * as well as any contained in visible things
	 *
	 * returns true/false
	 */
	Location.prototype.isItemHere = function(item) {
		var items = [], thing = null, contents = '';

		$.each(this._things, function(i, id) {
			thing = new Thing(id);
			if (thing) {
				//item!
				if (thing.getType() == 'item') items = items.concat(id);

				//contents!
				contents = thing.getContentIds();
				if (contents) items = items.concat(contents);
			}
		});

		return items.indexOf(item) >= 0;
	};

	//take the candle...
	Location.prototype.removeThing = function(id) {
		if (!id) return;

		//have to interact directory w/ the JSON here for it to work
		var things = gruel.adventure.locations[this._here].things;

		var key = things.indexOf(id);
		if (key >= 0) {
			//it's at this location...goodbye
			things.splice(key, 1);
		}
		else {
			//not here? check containers
			var container = null;
			$.each(this._things, function(i,thing_id) {
				container = new Thing(thing_id);
				if (container.getContentIds().indexOf(id) >= 0) {
					container.removeItemFromContents(id);
					return false;
				}
			});
		}
	};

	//put the candle back...
	Location.prototype.addThing = function(id) {
		if (!id) return;

		//have to interact directory w/ the JSON here for it to work
		var things = gruel.adventure.locations[this._here].things;
		if (things.indexOf(id) == -1) {
			things.push(id);
		}
	};

	/**
	 * getVisible()
	 * ----------------
	 * get all of item and fixture ids that
	 * we can access from this location
	 * (this is good for grabbing something by name)
	 *
	 * returns array of ids
	 */
	Location.prototype.getVisible = function() {
		var loc = gruel.adventure.locations[this._here];
		if (typeof loc == 'undefined' || loc.length == 0) return [];

		var things = loc.things;
		if (typeof things == 'undefined' || things.length == 0) return [];

		//add ourselves because..."Wherever you go, there you are."
		things = things.concat([gruel.adventure.me]);

		return things;
	};

	//okay, now just the items...
	Location.prototype.getVisibleItems = function () {
		var items = [], thing = {};

		$.each(this._things, function(i, id) {
			thing = new Thing(id);
			if (thing.getType() == 'item') items.push(id);
		});

		return items;
	}

	return Location;
}());