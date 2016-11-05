var Location = (function() {
	"use strict";

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

		this._here = this.formatCoords(gLocation);	//coordinates of where we are ("0,0,0")
		this._name = json[this._here].name;					//location NAME
		this._desc = json[this._here].desc;					//location description
		this._things = this.getVisible();						//all those items and fixtures one can find here
		this._requires = this.getRequires();				//anything that we require to get to here
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

	/**
	 * look()
	 * ------------
	 * THE function to display the location on the screen
	 */
	Location.prototype.look = function() {
		var name = this.getName();
		var desc = this.getDesc();

		//display location
		$('#location').html(name+'<br /><br />'+desc).fadeIn();

		//clear words spot
		gruel.msg.clear();

		//show any items that are here
		this.showItems();

		//clear input
		gruel.msg.resetCmd();
	};

	/**
	 * updateLocation()
	 * ----------------------
	 * our main function to move from one location to another
	 * returns json result
	 * - success = well...success!
	 * - error = msg to render
	 */
	Location.prototype.updateLocation = function(x,y,z) {
		var success = false, err = '';

		//set new position
		var pos = {};
		pos.x = gLocation.x + parseInt(x);
		pos.y = gLocation.y + parseInt(y);
		pos.z = gLocation.z + parseInt(z);

		var coords = this.formatCoords(pos);

		//are we in a going to a bad place?
		if (typeof gruel.adventure.locations[coords] != 'undefined') {
			//do we have the requirements?
			var has_requirements = this.hasRequirementsFor(coords);

			if (has_requirements.success) {
				//set the new location
				gLocation = pos;

				//update object
				this.setLocalData();

				//huzzah!
				success = true;
			}
			else {
				err = has_requirements.err;
			}
		}

		return {'success':success,'err':err};
	};

	/**
	 * hasRequirementsFor()
	 * ----------------------
	 * make sure we have whatever we need (fixture/item) to get to the next location
	 */
	Location.prototype.hasRequirementsFor = function(new_coords) {
		var success = false, err = '';
		var requires = gruel.adventure.locations[new_coords].requires;
		var things = this.getVisible();

		if (typeof requires != 'undefined') {
			$.each(requires, function(id, msg) {
				if (things.indexOf(parseInt(id)) >= 0) {
					success = true;
					return false;
				}
				else {
					err = msg;
				}
			});
		}
		else {
			//requires nothing
			success = true;
		}

		return {'success':success,'err':err};
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