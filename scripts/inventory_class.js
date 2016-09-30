var Inventory = (function() {
	"use strict";

	//construct
	function Inventory() {
		//what's in our inventory?
		this.getInv();
	};

	Inventory.prototype.items = function() {
		return this._items;
	};

	/**
	 * getInv()
	 * ----------------
	 * grab all our inventory items from localStorage
	 * and set them in _items as an array()
	 * (these are ids; not names)
	 */
	Inventory.prototype.getInv = function() {
		var inventory = localStorage.getItem(INVENTORY);
		inventory = inventory.length > 0 ? inventory.split(/,/).map(Number) : [];
		this._items = inventory;
	};

	Inventory.prototype.isInInv = function(ids) {
		var res = false;
		var items = [];

		//convert to array if it's not already
		ids.isArray ? items.concat(ids) : items.push(ids);

		$.each(items, $.proxy(function(i, id) {
			if ($.inArray(id, this._items)) {
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
		if ($.inArray(item, this._items)) {
			this._items.push(item);
			localStorage.setItem(INVENTORY,this._items);
		}
	};

	Inventory.prototype.dropItem = function(item) {
		var key = this._items.indexOf(item);
		this._items.splice(key, 1);
		localStorage.setItem(INVENTORY,this._items);
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
		if (!$.inArray(item, this._items)) return false;

		//lose it
		this.dropItem(item);

		//add to location
		var loc = new Location();
		loc.addThing(item);

		return true;
	};

	return Inventory;
}());