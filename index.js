/**
 * @typedef {{type: string}} Rule
 * @typedef {(...param) => Rule} RuleMaker
 * @typedef {Rule & {rules?: Rule[]}} ComboRule
 * @typedef {ComboRule} ItemRule
 * @typedef {Rule & {message?: string}} CheckRule
 * @typedef {CheckRule & {min: number, max: number}} RangeRule
 * @typedef {CheckRule & {begin: string|Date, end: string|Date}} BetweenRule
 * @typedef {CheckRule & {regex: RegExp|string}} PatternRule
 * @typedef {CheckRule & {value: number}} ValueRule
 * @typedef {CheckRule & {value: string|Date}} DateRule
 * @typedef {ItemRule & {message: string}} RequiredRule
 * @typedef {ItemRule & {name: string}} PropRule
 * @typedef {Rule & {rules?: CheckRule[]}} AnyRule
 * @typedef {Rule & {rules?: ComboRule[]}} UnionRule
 * @typedef {(input: any) => void} Validator
 * @typedef {(rule: Rule) => Validator} Schema
 */

export class ValidationError extends Error {
	constructor(msg) {
		super(msg);
	}
}

export class SchemaError extends Error {
	constructor(msg) {
		super(msg);
	}
}

const RULES = {
	mismatch: null,
	equal: equalRule,
	min: minRule,
	max: maxRule,
	less: lessRule,
	more: moreRule,
	before: beforeRule,
	after: afterRule,
	begin: beginRule,
	end: endRule,
	range: rangeRule,
	between: betweenRule,
	pattern: patternRule,
	any: anyRule,
	required: requiredRule,
	prop: propRule,
	item: itemRule,
	object: objectRule,
	string: stringRule,
	number: numberRule,
	boolean: booleanRule,
	date: dateRule,
	array: arrayRule,
	union: unionRule
};

const PRIMITIVE = {
	object: objectRule,
	string: stringRule,
	number: numberRule,
	array: arrayRule,
	boolean: booleanRule,
	date: dateRule
};

function fill(info, message) {
	if (typeof message === 'string' || typeof message === 'number') {
		info.message = message.toString();
	}
	return info;
}

/**
 * Specified value, only be used as child rule of the primitive type string, number and boolean
 * @param {number|string|boolean|Date} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function equal(value, message = null) {
	return fill({
		type: 'equal',
		value: value
	}, message);
}

/**
 * Specify minimum value or length, only be used as child rule of the primitive type
 * @param {number} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function min(value, message = null) {
	return fill({
		type: 'min',
		value: value
	}, message);
}

/**
 * Specify maximum value or length, only be used as child rule of the primitive type
 * @param {number} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function max(value, message = null) {
	return fill({
		type: 'max',
		value: value
	}, message);
}


/**
 * Specify value or length's range, only be used as child rule of the primitive type
 * @param {number} min
 * @param {number} max
 * @param {string} message
 * @returns {RangeRule}
 */
export function range(min, max, message = null) {
	return fill({
		type: 'range',
		min: min,
		max: max,
	}, message);
}

export function less(value, message = null) {
	return fill({
		type: 'less',
		value: value
	}, message);
}

export function more(value, message = null) {
	return fill({
		type: 'more',
		value: value
	}, message);
}


export function before(value, message = null) {
	return fill({
		type: 'before',
		value: value
	}, message);
}

export function after(value, message = null) {
	return fill({
		type: 'after',
		value: value
	}, message);
}

/**
 * @param {string|Date} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function begin(value, message = null) {
	return fill({
		type: 'begin',
		value: value
	}, message);
}

/**
 * @param {string|Date} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function end(value, message = null) {
	return fill({
		type: 'end',
		value: value
	}, message);
}


/**
 * Specify date range, only be used as child rule of the date type
 * @param {string|Date} begin
 * @param {string|Date} end
 * @param {string} message
 * @returns {RangeRule}
 */
export function between(begin, end, message = null) {
	return fill({
		type: 'between',
		begin: begin,
		end: end,
	}, message);
}

/**
 * Specify string pattern, only be used as child rule of the string type
 * @param {RegExp|string} regex
 * @param {string} message
 * @returns {PatternRule}
 */
export function pattern(regex, message = null) {
	return fill({
		type: 'pattern',
		regex: regex instanceof RegExp ? regex.toString() : regex
	}, message);
}

/**
 * Specify value must be provided, only be used as child rule of the primitive or group type
 * @param {string} message
 * @param  {...ComboRule} rules
 * @returns {RequiredRule}
 */
export function required(message, ...rules) {
	if (typeof message === 'object') {
		rules = rules.concat(message, ...rules);
		message = null;
	}
	return fill({
		type: 'required',
		rules: rules
	}, message);
}

/**
 * Show custom message when type mismatched, only be used as child rule of the primitive or group type
 * @param {string} message
 * @returns {CheckRule}
 */
export function mismatch(message = null) {
	return fill({
		type: 'mismatch'
	}, message);
}

/**
 * Only be used as child rule of array type
 * @param  {...ComboRule} rules
 * @returns {ItemRule}
 */
export function item(...rules) {
	return {
		type: 'item',
		rules: rules
	};
}

/**
 * Only be used as child rule of object type
 * @param {string} name
 * @param  {...ComboRule} rules
 * @returns {PropRule}
 */
export function prop(name, ...rules) {
	return {
		type: 'prop',
		name: name,
		rules: rules
	};
}

/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {AnyRule}
 */
export function any(...rules) {
	return {
		type: 'any',
		rules: rules
	};
}

/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 * @param  {...ComboRule} rules
 * @returns {UnionRule}
 */
export function union(...rules) {
	return {
		type: 'union',
		rules: rules
	};
}

/**
 * Primitive type object, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {ComboRule}
 */
export function object(...rules) {
	return {
		type: 'object',
		rules: rules
	};
}

/**
 * Primitive type number, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {ComboRule}
 */
export function boolean(...rules) {
	return {
		type: 'boolean',
		rules: rules
	};
}

/**
 * Primitive type number, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {ComboRule}
 */
export function number(...rules) {
	return {
		type: 'number',
		rules: rules
	};
}

/**
 * Primitive type string, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {ComboRule}
 */
export function string(...rules) {
	return {
		type: 'string',
		rules: rules
	};
}

/**
 * Primitive type string, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {ComboRule}
 */
export function date(...rules) {
	return {
		type: 'date',
		rules: rules
	};
}

/**
 * Primitive type array, can be used as top level rule
 * @param  {...CheckRule} rules
 * @returns {ComboRule}
 */
export function array(...rules) {
	return {
		type: 'array',
		rules: rules
	};
}

//////////////////////////////////////////////////

function getInputType(input) {
	let inputType = typeof input;
	if (inputType === 'object' && input instanceof Array) {
		inputType = 'array';
	} else if (inputType === 'object' && input instanceof Date) {
		inputType = 'date';
	}
	return inputType;
}

/**
 *
 * @param {*} input
 * @param {Validator[]} validators
 */
function validate(input, validators) {
	validators.forEach((validator) => {
		validator(input);
	});
}

/**
 *
 * @param {Rule} rule
 * @param {RuleMaker[]} availableRules
 * @returns {Validator}
 */
function createValidator(rule, availableRules, parentRule = null) {
	if (!rule || !rule.type) {
		throw new SchemaError(`Invalid rule: cannot be '${typeof rule}'`);
	}
	if (!availableRules.find(r => r.name === rule.type)) {
		throw new SchemaError(`Unexpected rule: '${rule.type}'`);
	}
	return RULES[rule.type](rule, parentRule);
}

/**
 * @param {ComboRule} parentRule
 * @param {Rule[]} subRules
 * @param {Validator[]} validators
 * @param {...RuleMaker} availableRules
 * @returns {string} Mismatch message
 */
function createSubValidators(parentRule, subRules, validators, ...availableRules) {
	let mismatchMessage = null;
	let i = 0;
	let rules = subRules || [];
	try {
		for (i = 0; i < rules.length; i++) {
			let r = rules[i];
			if (r.type === mismatch.name) {
				if (!availableRules.find(ar => ar.name === r.type)) {
					throw new SchemaError(`Unexpected rule: '${r.type}'`);
				}
				mismatchMessage = r.message;
			} else {
				validators.push(createValidator(r, availableRules, parentRule));
			}
		}
		return mismatchMessage;
	} catch (e) {
		throw new SchemaError(`Invalid "${parentRule.type}" rule (sub rule ${i+1}):\n    > ${e.message}`);
	}
}




/**
 * @param {PropRule} rule
 * @returns {Validator}
 */
function propRule(rule) {
	if (!(rule.rules instanceof Array) || rule.rules.length === 0) {
		throw new SchemaError('Invalid "prop" rule: must provide a sub rule');
	}
	if (rule.rules.length > 1) {
		throw new SchemaError('Invalid "prop" rule: can only have one sub rule');
	}
	if (!rule.name && rule.name !== 0) {
		throw new SchemaError('Invalid "prop" rule: "name" must be a valid key or index');
	}
	let validator;
	try {
		validator = createValidator(rule.rules[0], [required, object, string, number, array, boolean, date, union]);
	} catch (e) {
		throw new SchemaError(`Invalid "prop" rule of "${rule.name}":\n    > ${e.message}`);
	}
	return (input) => {
		try {
			if (typeof input === 'object' && input !== null) {
				validator(input[rule.name]);
			}
		} catch (e) {
			throw new ValidationError(`Invalid property "${rule.name}": ${e.message}`);
		}
	};
}

/**
 * @param {PropRule} rule
 * @returns {Validator}
 */
function itemRule(rule) {
	if (!(rule.rules instanceof Array) || rule.rules.length === 0) {
		throw new SchemaError('Invalid "item" rule: must provide a sub rule');
	}
	if (rule.rules.length > 1) {
		throw new SchemaError('Invalid "item" rule: can only have one sub rule');
	}
	let validator;
	try {
		validator = createValidator(rule.rules[0], [required, object, string, number, array, boolean, date, union]);
	} catch (e) {
		throw new SchemaError(`Invalid "item" rule:\n    > ${e.message}`);
	}
	return (input) => {
		let i;
		try {
			if (input instanceof Array) {
				for (i = 0; i < input.length; i++) {
					validator(input[i]);
				}
			}
		} catch (e) {
			throw new ValidationError(`Invalid item [${i}]: ${e.message}`);
		}
	};
}

/**
 * @param {RequiredRule} rule
 * @returns {Validator}
 */
function requiredRule(rule) {
	let validator = null;
	if (rule.rules instanceof Array) {
		if (rule.rules.length > 1) {
			throw new SchemaError('Invalid "required" rule: can only have one sub rule');
		}
		if (rule.rules.length > 0) {
			try {
				validator = createValidator(rule.rules[0], [object, string, number, array, boolean, date, union]);
			} catch (e) {
				throw new SchemaError(`Invalid "required" rule:\n    > ${e.message}`);
			}
		}
	}
	return (input) => {
		if (typeof input === 'undefined' || input === null) {
			if (rule.message) {
				throw new ValidationError(rule.message);
			} else {
				throw new ValidationError('value is required');
			}
		}
		if (validator) {
			validator(input);
		}
	};
}

/**
 *
 * @param {ValueRule} rule
 * @param {string} state
 * @param {string} what
 */
function invalidValueMessage(rule, state) {
	if (rule.message) {
		throw new ValidationError(rule.message);
	} else {
		throw new ValidationError(`${state} ${rule.value}`);
	}
}

/**
 * @param {ValueRule} rule
 * @returns {Validator}
 */
function equalRule(rule, parentRule) {
	function invalidType() {
		throw new SchemaError(`Invalid "equal" rule: "value" property must be a valid ${parentRule.type}`);
	}
	let valType = getInputType(rule.value);
	if (parentRule.type === date.name) {
		if (valType === 'string') {
			if (isNaN(new Date(rule.value).getTime())) {
				invalidType();
			}
		} else if (parentRule.type !== valType || isNaN(rule.value.getTime())) {
			invalidType();
		}
	} else if (parentRule.type !== valType || (valType === 'number' && isNaN(rule.value))) {
		invalidType();
	}
	return (input) => {
		if (parentRule.type === getInputType(input)) {
			if (parentRule.type === 'date') {
				if (input.getTime() !== new Date(rule.value).getTime()) {
					invalidValueMessage(rule, 'must be');
				}
			} else if (input !== rule.value) {
				invalidValueMessage(rule, 'must be');
			}
		}
	};
}

/**
 *
 * @param {ValueRule} rule
 * @param {ComboRule} parentRule
 * @param {(input: number, targetValue: number) => boolean} compare
 * @param {string} msg
 */
function valueRuleBase(rule, parentRule, compare, msg) {
	if (!(typeof rule.value === 'number') || isNaN(rule.value)) {
		throw new SchemaError(`Invalid "${rule.type}" rule: "value" property must be a valid number`);
	}
	return (input) => {
		if (parentRule.type === 'number') {
			if (compare(input, rule.value) || isNaN(input)) {
				invalidValueMessage(rule, `value ${msg}`);
			}
		} else if (parentRule.type === 'string') {
			if (compare(input.length, rule.value)) {
				invalidValueMessage(rule, `string length ${msg}`);
			}
		} else if (parentRule.type === 'array') {
			if (compare(input.length, rule.value)) {
				invalidValueMessage(rule, `array length ${msg}`);
			}
		}
	};
}

function minRule(rule, parentRule) {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input < targetValue, 'must be greater or equal to');
}

function maxRule(rule, parentRule) {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input > targetValue, 'must be less or equal to');
}

function lessRule(rule, parentRule) {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input >= targetValue, 'must be less than');
}

function moreRule(rule, parentRule) {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input <= targetValue, 'must be greater than');
}

/**
 *
 * @param {DateRule} rule
 * @param {(input: long, targetValue: long) => boolean} compare
 * @param {string} msg
 */
function dateRuleBase(rule, compare, msg) {
	function invalidType() {
		throw new SchemaError(`Invalid "${rule.type}" rule: "value" property must be a valid date`);
	}
	let valType = getInputType(rule.value);
	if (valType === 'string') {
		if (isNaN(new Date(rule.value).getTime())) {
			invalidType();
		}
	} else if (valType !== 'date' || isNaN(rule.value.getTime())) {
		invalidType();
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'date') {
			if (compare(input.getTime(), new Date(rule.value).getTime())) {
				invalidValueMessage(rule, msg);
			}
		}
	};
}

function beforeRule(rule) {
	return dateRuleBase(rule, (input, targetValue) => input >= targetValue, 'Date must earlier to');
}

function afterRule(rule) {
	return dateRuleBase(rule, (input, targetValue) => input <= targetValue, 'Date must later to');
}

function beginRule(rule) {
	return dateRuleBase(rule, (input, targetValue) => input < targetValue, 'Date must later or equal to');
}

function endRule(rule) {
	return dateRuleBase(rule, (input, targetValue) => input > targetValue, 'Date must earlier or equal to');
}

/**
 * @param {RangeRule} rule
 * @returns {Validator}
 */
function rangeRule(rule) {
	if (!(typeof rule.min === 'number') || isNaN(rule.min)) {
		throw new SchemaError('Invalid "range" rule: "min" property must be a valid number');
	}
	if (!(typeof rule.max === 'number') || isNaN(rule.max)) {
		throw new SchemaError('Invalid "range" rule: "max" property must be a valid number');
	}
	if (rule.min >= rule.max) {
		throw new SchemaError('Invalid "range" rule: "min" property must be less or equal to "max" property');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input < rule.min || input > rule.max || isNaN(input)) {
				if (rule.message) {
					throw new ValidationError(rule.message);
				} else {
					throw new ValidationError(`Value must between ${rule.min} to ${rule.max}`);
				}
			}
		}
	};
}

/**
 * @param {BetweenRule} rule
 * @returns {Validator}
 */
function betweenRule(rule) {
	function invalidType(prop) {
		throw new SchemaError(`Invalid "between" rule: "${prop}" property must be a valid date`);
	}
	function checkProp(prop) {
		if (!(rule[prop] instanceof Date)) {
			if (typeof rule[prop] === 'string') {
				let dt = new Date(rule[prop]);
				if (isNaN(dt.getTime())) {
					invalidType(prop);
				} else {
					return dt;
				}
			} else {
				invalidType(prop);
			}
		} else {
			if (isNaN(rule[prop].getTime())) {
				invalidType(prop);
			} else {
				return rule[prop];
			}
		}
	}
	let begin = checkProp('begin');
	let end = checkProp('end');
	if (begin.getTime() >= end.getTime()) {
		throw new SchemaError('Invalid "between" rule: "begin" property must be ealier or equal to "end" property');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'date') {
			if (input.getTime() < begin.getTime() || input.getTime() > end.getTime()) {
				if (rule.message) {
					throw new ValidationError(rule.message);
				} else {
					throw new ValidationError(`Date must between ${rule.begin} and ${rule.end}`);
				}
			}
		}
	};
}


const PATTERN_ERR_MSG = 'Invalid "pattern" rule: must provide a valid RegExp object or regular expression string';

/**
 * @param {PatternRule} rule
 * @returns {Validator}
 */
function patternRule(rule) {
	let exp;
	if (rule.regex instanceof RegExp) {
		exp = rule.regex;
	} else if (typeof rule.regex === 'string') {
		try {
			exp = new RegExp(...rule.regex.match(/\/(.*)\/(.*)/).slice(1));
		} catch (e) {
			throw new SchemaError(PATTERN_ERR_MSG + ': ' + e.message);
		}
	} else {
		throw new SchemaError(PATTERN_ERR_MSG);
	}
	return (input) => {
		if (typeof input === 'string') {
			if (!exp.test(input)) {
				if (rule.message) {
					throw new ValidationError(rule.message);
				} else {
					throw new ValidationError(`must match expression: ${exp.toString()}`);
				}
			}
		}
	};
}

/**
 * @param {AnyRule} rule
 * @param {ComboRule} parentRule
 * @returns {Validator}
 */
function anyRule(rule, parentRule) {
	let validators = [];
	if (parentRule.type === string.name) {
		createSubValidators(parentRule, rule.rules, validators, equal, min, max, pattern);
	} else if (parentRule.type === number.name) {
		createSubValidators(parentRule, rule.rules, validators, equal, min, max, less, more, range);
	} else if (parentRule.type === boolean.name) {
		createSubValidators(parentRule, rule.rules, validators, equal);
	} else if (parentRule.type === date.name) {
		createSubValidators(parentRule, rule.rules, validators, equal, begin, end, before, after, between);
	}
	if (validators.length < 2) {
		throw new SchemaError('Invalid "any" rule: at least provide two sub rules');
	}
	return (input) => {
		let errors = [];
		for (let i = 0; i < validators.length; i++) {
			try {
				validators[i](input);
				return;
			} catch(e) {
				errors.push(e.message);
			}
		}
		if (errors.length === 1) {
			throw new ValidationError(errors[0]);
		} else {
			let msg = errors.map((e, i) => `${i+1}. ${e}`).join(', ');
			throw new ValidationError(`not eligible: (${msg})`);
		}
	};
}


/**
 * @param {ComboRule} rule
 * @param {...RuleMaker} availableRules
 * @returns {Validator}
 */
function createPrimitiveRule(rule, ...availableRules) {
	let validators = [];
	let mismatchMessage = createSubValidators(rule, rule.rules, validators, ...availableRules);
	function throwMismatch(inputType) {
		if (mismatchMessage) {
			throw new ValidationError(mismatchMessage);
		} else {
			throw new ValidationError(`Unexpected type: require '${rule.type}' but found '${inputType}'`);
		}
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType !== 'undefined' && input !== null) {
			if (rule.type === 'date' && inputType === 'string') {
				input = new Date(input);
				if (isNaN(input.getTime())) {
					throwMismatch(inputType);
				}
			} else if (inputType !== rule.type) {
				throwMismatch(inputType);
			} else if (inputType === 'date' && isNaN(input.getTime())) {
				throwMismatch('invalid date');
			} else if (inputType === 'number' && isNaN(input)) {
				throwMismatch('invalid number');
			}
		}
		validate(input, validators);
	};
}

function objectRule(rule) {
	return createPrimitiveRule(rule, prop, mismatch);
}

function stringRule(rule) {
	return createPrimitiveRule(rule, equal, min, max, pattern, any, mismatch);
}

function numberRule(rule) {
	return createPrimitiveRule(rule, equal, min, max, less, more, range, any, mismatch);
}

function arrayRule(rule) {
	return createPrimitiveRule(rule, min, max, prop, item, mismatch);
}

function booleanRule(rule) {
	return createPrimitiveRule(rule, equal, mismatch);
}

function dateRule(rule) {
	return createPrimitiveRule(rule, equal, begin, end, before, after, between, any, mismatch);
}


const UNION = { object,	string,	number,	array, boolean, date,	mismatch };

/**
 * @param {ComboRule} rule
 * @returns {Validator}
 */
function unionRule(rule) {
	let typeValidator = {};
	let rules = rule.rules || [];
	try {
		rules.forEach(r => {
			if (!r || !r.type) {
				throw new SchemaError(`Invalid rule: cannot be '${typeof r}'`);
			}
			if (!(r.type in UNION)) {
				throw new SchemaError(`Unexpected rule: ${r.type}`);
			}
		});
		rules.filter(r => r.type in PRIMITIVE).forEach(
			r => typeValidator[r.type] = PRIMITIVE[r.type](r)
		);
	} catch (e) {
		throw new SchemaError(`Invalid "union" rule:\n    > ${e.message}`);
	}
	let mismatchRule = rules.find(r => r.type === mismatch.name);
	let mismatchMessage = mismatchRule ? mismatchRule.message : null;
	let supportTypes = Object.keys(typeValidator);
	if (supportTypes.length < 2) {
		throw new SchemaError('Invalid "union" rule, at least provide two different types');
	}

	return (input) => {
		let inputType = getInputType(input);
		if (inputType !== 'undefined' && input !== null) {
			let validators = [];
			for (let type of supportTypes) {
				if (type === inputType) {
					validators.push(typeValidator[type]);
				} else if (type === 'date' && inputType === 'string' && !isNaN(new Date(input).getTime())) {
					validators.push(typeValidator[type]);
				}
			}
			if (validators.length == 0) {
				if (mismatchMessage) {
					throw new ValidationError(mismatchMessage);
				} else {
					throw new ValidationError(`Unexpected type: can be '${supportTypes.toString().replace(',', ', ')}' but found '${inputType}'`);
				}
			}
			let errors = [];
			for (let validator of validators) {
				try {
					validator(input);
					return;
				} catch (e) {
					errors.push(e.message);
				}
			}
			if (errors.length === 1) {
				throw new ValidationError(errors[0]);
			} else {
				let msg = errors.map((e, i) => `R${i+1}. ${e}`).join('; ');
				throw new ValidationError(`No rule matched: [${msg}]`);
			}
		}
	};
}

export class Schema {
	constructor(rule) {
		this.toJSON = () => {
			return rule;
		};
		this.toString = () => {
			return JSON.stringify(rule, null, 2);
		};
		this.validate = createValidator(rule, [required, object, string, number, array, boolean, date, union]);
	}
}
