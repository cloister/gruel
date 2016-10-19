var Inventory = (function() {
	"use strict";

	//construct
	function Inventory() {
		//we already know our gInventory, so set our contents
		//aka "all the stuff inside the stuff in our pocketses"
		this._contents = this.getStuffInsideStuff();
	};

	/**
	 * getStuffInsideStuff()
	 * -------------------
	 * grab the contents of our inventory items
	 */
	Inventory.prototype.getStuffInsideStuff = function() {
		var inv_contents = [];

		$.each(gInventory, $.proxy(function(i, id) {
			var thing = new Thing(id);
			var contents =  thing ? thing.getContentIds() : '';
			if (contents) inv_contents = inv_contents.concat(contents);
		},this));

		return inv_contents;
	};

	Inventory.prototype.getItems = function() {
		return gInventory;
	};

	Inventory.prototype.getContents = function() {
		return this._contents;
	};

	//combo of gInventory and _contents
	Inventory.prototype.getAll = function() {
		//Add it up! Add it up! Add it up!
		return gInventory.concat(this._contents);
	};

	Inventory.prototype.isInInv = function(ids) {
		var res = false;
		var items = [];

		//convert to array if it's not already
		if (!$.isArray(ids)) ids = [ids];
		items = items.concat(ids);

		$.each(items, $.proxy(function(i, id) {
			if ($.inArray(id, this.getAll()) >= 0) {
				res = true;
				return false;
			}
		},this));

		return res;
	};

	Inventory.prototype.formatItemsAsHtml = function() {
			var inv = [], item = '', contents = [];

			$.each(this.getItems(), $.proxy(function(i, id) {
				item = new Thing(id);
				if (item && item.getType() == 'item') {
					//add item
					inv.push(item.getName());

					contents = item.getContentIds();
					$.each(contents, $.proxy(function(i, id) {
						item = new Thing(id);
						if (item && item.getType() == 'item') {
							//add contents item
							inv.push('- '+item.getName());
						}
					},this));
				}
			},this));

			inv = inv.join('<br />');
			return inv;
	};

	/**
	 * addItem()
	 * ------------------------
	 * add an item to inventory
	 */
	Inventory.prototype.addItem = function(item) {
		item = parseInt(item);

		//make sure it's not already in there
		if (this.isInInv(item)) return;
		if ($.inArray(item, gInventory) == -1) gInventory.push(item);
	};

	/**
	 * dropItem()
	 * ------------------------
	 * remove an item from inventory
	 */
	Inventory.prototype.dropItem = function(item) {
		var key = gInventory.indexOf(item);
		if (key >= 0) gInventory.splice(key, 1);

		var key = this._contents.indexOf(item);
		if (key >= 0) {
			this._contents.splice(key, 1);
			var container = Thing.getContainerObjectById(item);
			container.removeItemFromContents(item);
		}
	};

	Inventory.prototype.pickUp = function(item) {
		if (item == '') return false;

		//make sure the item is where we are
		var loc = new Location();
		if (!loc.isItemHere(item)) return false;

		//add it
		this.addItem(item);

		//remove from location
		loc.removeThing(item);

		return true;
	};

	Inventory.prototype.dropIt = function(item) {
		item = parseInt(item);
		if (!item) return false;

		//make sure we have it
		if (!this.isInInv(item)) return false;

		//lose it
		this.dropItem(item);

		//add to location
		var loc = new Location();
		loc.addThing(item);

		return true;
	};

	return Inventory;
}());