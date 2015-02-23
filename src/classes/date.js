var FS = require('./../FamilySearch');

// construct formal date from [about|after|before] [[day] month] year [BC]
var constructFormalDate = function(fields, ignoreModifiers) {
  var prefix = '', suffix = '', day = '', month = '', year, sign = '+';
  var pos = 0;
  // handle modifier
  if (fields[pos] === 'about') {
    if (!ignoreModifiers) {
      prefix = 'A';
    }
    pos++;
  }
  else if (fields[pos] === 'before') {
    if (!ignoreModifiers) {
      prefix = 'A/';
    }
    pos++;
  }
  else if (fields[pos] === 'after') {
    if (!ignoreModifiers) {
      prefix = 'A';
      suffix = '/';
    }
    pos++;
  }
  // handle day (no month names are <= 2 characters)
  if (fields[pos].length <= 2) {
    day = (fields[pos].length === 1 ? '0' : '') + fields[pos];
    pos++;
  }
  // handle month
  var monthNum = ['january','february','march','april','may','june','july','august','september','october','november','december']
    .indexOf(fields[pos]) + 1;
  if (monthNum > 0) {
    month = (monthNum < 10 ? '0' : '') + monthNum.toString();
    pos++;
  }
  // handle year (required)
  year = fields[pos];
  pos++;
  // handle bc
  if (pos < fields.length && fields[pos] === 'bc') {
    sign = '-';
  }
  // construct formal date
  return prefix+sign+year+(month ? '-' : '')+month+(day ? '-' : '')+day+suffix;
};

/**
 * @ngdoc function
 * @name authorities.types:constructor.Date
 * @description
 *
 * Standardized date
 */
var FSDate = FS.Date = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name authorities.functions:createDate
 * @param {Object} data [Date](https://familysearch.org/developers/docs/api/gx/Date_json) data
 * @return {Object} {@link authorities.types:constructor.Date Date}
 * @description Create a {@link authorities.types:constructor.Date Date} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDate = function(data){
  return new FSDate(this, data);
};

FSDate.prototype = {
  constructor: FSDate,

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#normalized
   * @propertyOf authorities.types:constructor.Date
   * @return {string} normalized date
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#earliest
   * @propertyOf authorities.types:constructor.Date
   * @return {Object} information (normalized, numeric, astro) about earliest date in a range
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#latest
   * @propertyOf authorities.types:constructor.Date
   * @return {Object} information (normalized, numeric, astro) about latest date in a range
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#requested
   * @propertyOf authorities.types:constructor.Date
   * @return {string} requested date to standardize
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#original
   * @propertyOf authorities.types:constructor.Date
   * @return {string} original date to standardize
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#ambiguous
   * @propertyOf authorities.types:constructor.Date
   * @return {boolean} true if ambiguous
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#valid
   * @propertyOf authorities.types:constructor.Date
   * @return {boolean} true if valid
   */

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#$getFormalDate
   * @methodOf authorities.types:constructor.Date
   * @function
   * @return {string} GEDCOM-X formal date format
   */
  $getFormalDate: function() {
    // as far as I can tell, normalized date appears in one of three formats:
    // [about|after|before] [[day] month] year [BC]
    // from [[day] month] year [BC] to [[day] month] year [BC]
    // [[day] month] year [BC] (/ [[day] month] year [BC])+
    var formalDate = '';
    if (this.normalized) {
      // split into fields
      var fields = this.normalized.trim().toLowerCase().split(' ');
      // GEDCOM-X formal date doesn't allow the third format, so keep just the first date
      var pos = fields.indexOf('/');
      if (pos >= 0) {
        fields = fields.slice(0, pos);
      }
      // handle from <date> to <date>
      if (fields[0] === 'from') {
        pos = fields.indexOf('to');
        // date normalization has a bug where "before 20 Mar 2006 - after 16 dec 2007"
        // is normalized to "from after 20 March 2006 to 16 December 2007"
        // to get around this bug, ignore date modifiers when parsing date-range dates so we return simply "+2006-03-20/+2007-12-16"
        formalDate = constructFormalDate(fields.slice(1,pos), true)+'/'+constructFormalDate(fields.slice(pos+1), true);
      }
      else {
        // handle <date>
        formalDate = constructFormalDate(fields, false);
      }
    }
    return formalDate;
  }
};
