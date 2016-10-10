var Inventory = (function() {
	"use strict";

	//construct
	function Inventory() {
		this._items = gInventory;
	};

	Inventory.prototype.items = function() {
		return this._items;
	};

	Inventory.prototype.isInInv = function(ids) {
		var res = false;
		var items = [];

		//convert to array if it's not already
		if (!$.isArray(ids)) ids = [ids];
		items = items.concat(ids);

		$.each(items, $.proxy(function(i, id) {
			if ($.inArray(id, this._items) >= 0) {
				res = true;
				return false;
			}
		},this));

		return res;
	}

	Inventory.prototype.formatItemsAsHtml = function() {
			var inv = [];
			var item = '';

			$.each(this._items, $.proxy(function(i, id) {
				item = new Thing(id);
				if (item) inv.push(item.getName());
			},this));

			inv = inv.join('<br />');
			return inv;
	};

	/**
	 * add an item to inventory
	 * - add it to _items
	 * - add it to our localStorage
	 */
	Inventory.prototype.addItem = function(item) {
		item = parseInt(item);

		//make sure it's not already in there
		if ($.inArray(item, this._items) == -1) {
			this._items.push(item);
			gInventory = this._items;
		}
	};

	Inventory.prototype.dropItem = function(item) {
		var key = this._items.indexOf(item);
		this._items.splice(key, 1);
		gInventory = this._items;
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
		if ($.inArray(item, this._items) == -1) return false;

		//lose it
		this.dropItem(item);

		//add to location
		var loc = new Location();
		loc.addThing(item);

		return true;
	};

	return Inventory;
}());