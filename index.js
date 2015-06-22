'use strict';

var stringify = require('json-stringify-safe')
  , find = require('propget');

/**
 * Replaces template tags in the supplied template string.
 *
 * @param {String} what Template that needs to have it's tags replaces.
 * @param {RegExp} tag Regular Expression that matches the template tags.
 * @param {Object} data Template data.
 * @returns {String}
 * @api public
 */
function replaces(what, tag, data) {
  return what.replace(tag, function replace(tag, modifier, key) {
    var value = find(data, key);

    if (modifier in replaces.modifier) {
      return replaces.modifier[modifier](key, value);
    }

    return value;
  });
}

/**
 * The various of data modifiers that are supported so we can easily modify the
 * data as the template wishes. The modifiers should follow the replacer pattern
 * of JSON.stringify so it can be easily used and re-used within each other.
 *
 * @type {Object}
 * @public
 */
replaces.modifier = {
  /**
   * Make sure that the data we're trying to add to the template is save to use
   * inside of HTML tags.
   *
   * @param {String} key Key of the data we're trying to replace.
   * @param {Mixed} data Actual content that we're inserting.
   * @returns {String}
   * @api private
   */
  '<>': function escape(key, data) {
    return data.toString().replace(/[&<>"']/g, function replace(char) {
      return replaces.entities[char];
    });
  },

  /**
   * Transform the receiving data to a JSON structure.
   *
   * @param {String} key Key of the data we're trying to replace.
   * @param {Mixed} data Actual content that we're inserting.
   * @returns {String}
   * @api private
   */
  '~': function stringify(key, data) {
    return JSON.stringify(data);
  },

  /**
   * Transform the receiving data to a JSON structure, but it doesn't crash on
   * circular references like a normal JSON.stringify would.
   *
   * @param {String} key Key of the data we're trying to replace.
   * @param {Mixed} data Actual content that we're inserting.
   * @returns {String}
   * @api private
   */
  '@': function circular(key, data) {
    return stringify(data);
  },

  /**
   * The safest of all various of modifiers, encode the data as a JSON structure
   * while making sure that the values inside the JSON cannot contain HTML
   * structures.
   *
   * @param {String} key Key of the data we're trying to replace.
   * @param {Mixed} data Actual content that we're inserting.
   * @returns {String}
   * @api private
   */
  '$': function save(key, data) {
    /**
     * Private replacer which will run all string content through the replaces
     * HTML entities modifier.
     *
     * @param {String} key Key of the data we're trying to replace.
     * @param {Mixed} data Actual content that we're inserting.
     * @returns {String}
     * @api private
     */
    function replacer(key, data) {
      if ('string' === typeof data) return replaces.modifier['<>'](key, data);
      return data;
    }

    try { return JSON.stringify(data, replacer); }
    catch (e) { return stringify(data, replacer); }
  },

  /**
   * Simple `escape` of the data.
   *
   * @param {String} key Key of the data we're trying to replace.
   * @param {Mixed} data Actual content that we're inserting.
   * @returns {String}
   * @api private
   */
  '%': function esc(key, data) {
    return escape(data);
  }
};

/**
 * Hash map with HTML chars that should be escaped and the value's that they
 * should be escaped with.
 *
 * @type {Object}
 * @public
 */
replaces.entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

//
// Expose the awesome replaces.
//
module.exports = replaces;
