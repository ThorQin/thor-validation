/**
 * @typedef {{type: string}} Rule
 * @typedef {(...param) => Rule} RuleMaker
 * @typedef {Rule & {rules?: Rule[]}} ComboRule
 * @typedef {ComboRule} ItemRule
 * @typedef {Rule & {message?: string}} CheckRule
 * @typedef {CheckRule & {min: number, max: number}} RangeRule
 * @typedef {CheckRule & {regex: RegExp|string}} PatternRule
 * @typedef {CheckRule & {value: number}} ValueRule
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

const SCHEMA = {
	mismatch: null,
	val: valSchema,
	less: lessSchema,
	more: moreSchema,
	min: minSchema,
	max: maxSchema,
	range: rangeSchema,
	pattern: patternSchema,
	any: anySchema,
	required: requiredSchema,
	prop: propSchema,
	item: itemSchema,
	object: objectSchema,
	string: stringSchema,
	number: numberSchema,
	boolean: booleanSchema,
	array: arraySchema,
	union: unionSchema
};

const PRIMITIVE = {
	object: objectSchema,
	string: stringSchema,
	number: numberSchema,
	array: arraySchema,
	boolean: booleanSchema
};

function fill(info, message) {
	if (typeof message === 'string' || typeof message === 'number') {
		info.message = message.toString();
	}
	return info;
}

/**
 * Specified value, only be used as child rule of the primitive type string, number and boolean
 * @param {number|string|boolean} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function val(value, message = null) {
	return fill({
		type: 'val',
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

export function less(value, message = null) {
	return fill({
		type: 'less',
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

export function more(value, message = null) {
	return fill({
		type: 'more',
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
export function mismatch(message) {
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
	if (!rule) {
		throw new SchemaError(`Invalid rule: cannot be '${typeof rule}'`);
	}
	if (!availableRules.find(r => r.name === rule.type)) {
		throw new SchemaError(`Unexpected rule: '${rule.type}'`);
	}
	return SCHEMA[rule.type](rule, parentRule);
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
		throw new SchemaError(`Invalid "${parentRule.type}" rule (sub rule ${i+1}): ${e.message}`);
	}
}



/**
 * @param {ComboRule} rule
 * @returns {Validator}
 */
function unionSchema(rule) {
	let typeValidator = {};
	let rules = rule.rules || [];
	rules.filter(r => r.type in PRIMITIVE).forEach(
		r => typeValidator[r.type] = PRIMITIVE[r.type](r)
	);
	let mismatchRule = rules.find(r => r.type === mismatch.name);
	let mismatchMessage = mismatchRule ? mismatchRule.message : null;
	let supportTypes = Object.keys(typeValidator);
	if (supportTypes.length < 2) {
		throw new SchemaError('Invalid "union" rule, at least provide two different types');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType !== 'undefined' && input !== null) {
			let validator = typeValidator[inputType];
			if (!validator) {
				if (mismatchMessage) {
					throw new ValidationError(mismatchMessage);
				} else {
					throw new ValidationError(`Unexpected type: can be '${supportTypes.toString().replace(',', ', ')}' but found '${inputType}'`);
				}
			} else {
				validator(input);
			}
		}
	};
}


/**
 * @param {PropRule} rule
 * @returns {Validator}
 */
function propSchema(rule) {
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
		validator = createValidator(rule.rules[0], [required, object, string, number, array, boolean, union]);
	} catch (e) {
		throw new SchemaError(`'Invalid "prop" rule of "${rule.name}": ${e.message}`);
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
function itemSchema(rule) {
	if (!(rule.rules instanceof Array) || rule.rules.length === 0) {
		throw new SchemaError('Invalid "item" rule: must provide a sub rule');
	}
	if (rule.rules.length > 1) {
		throw new SchemaError('Invalid "item" rule: can only have one sub rule');
	}
	let validator;
	try {
		validator = createValidator(rule.rules[0], [required, object, string, number, array, boolean, union]);
	} catch (e) {
		throw new SchemaError(`'Invalid "item" rule: ${e.message}`);
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
function requiredSchema(rule) {
	let validator = null;
	if (rule.rules instanceof Array) {
		if (rule.rules.length > 1) {
			throw new SchemaError('Invalid "required" rule: can only have one sub rule');
		}
		if (rule.rules.length > 0) {
			validator = createValidator(rule.rules[0], [object, string, number, array, boolean, union]);
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
function valSchema(rule, parentRule) {
	let valType = typeof rule.value;
	if (parentRule.type !== valType || (valType === 'number' && isNaN(rule.value))) {
		throw new SchemaError(`Invalid "val" rule: "value" property must be a valid ${parentRule.type}`);
	}
	return (input) => {
		if (parentRule.type === typeof input) {
			if (input !== rule.value) {
				invalidValueMessage(rule, 'Value !=');
			}
		}
	};
}

/**
 * @param {ValueRule} rule
 * @returns {Validator}
 */
function minSchema(rule) {
	if (!(typeof rule.value === 'number') || isNaN(rule.value)) {
		throw new SchemaError('Invalid "min" rule: "value" property must be a valid number');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input < rule.value || isNaN(input)) {
				invalidValueMessage(rule, 'Value should not be less than');
			}
		} else if (inputType === 'string') {
			if (input.length < rule.value) {
				invalidValueMessage(rule, 'String length should not be less than');
			}
		} else if (inputType === 'array') {
			if (input.length < rule.value) {
				invalidValueMessage(rule, 'Array length should not be less than');
			}
		}
	};
}

function lessSchema(rule) {
	if (!(typeof rule.value === 'number') || isNaN(rule.value)) {
		throw new SchemaError('Invalid "less" rule: "value" property must be a valid number');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input >= rule.value || isNaN(input)) {
				invalidValueMessage(rule, 'Value must be less than');
			}
		}
	};
}

/**
 * @param {ValueRule} rule
 * @returns {Validator}
 */
function maxSchema(rule) {
	if (!(typeof rule.value === 'number') || isNaN(rule.value)) {
		throw new SchemaError('Invalid "max" rule: "value" property must be a valid number');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input > rule.value || isNaN(input)) {
				invalidValueMessage(rule, 'Value should not be great than');
			}
		} else if (inputType === 'string') {
			if (input.length > rule.value) {
				invalidValueMessage(rule, 'String length should not be greater than');
			}
		} else if (inputType === 'array') {
			if (input.length > rule.value) {
				invalidValueMessage(rule, 'Array length should not be greater than');
			}
		}
	};
}

function moreSchema(rule) {
	if (!(typeof rule.value === 'number') || isNaN(rule.value)) {
		throw new SchemaError('Invalid "more" rule: "value" property must be a valid number');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input <= rule.value || isNaN(input)) {
				invalidValueMessage(rule, 'Value must be greater than');
			}
		}
	};
}

/**
 * @param {RangeRule} rule
 * @returns {Validator}
 */
function rangeSchema(rule) {
	if (!(typeof rule.min === 'number') || isNaN(rule.min)) {
		throw new SchemaError('Invalid "range" rule: "min" property must be a valid number');
	}
	if (!(typeof rule.max === 'number') || isNaN(rule.max)) {
		throw new SchemaError('Invalid "range" rule: "max" property must be a valid number');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input < rule.min || input > rule.max || isNaN(input)) {
				if (rule.message) {
					throw new ValidationError(rule.message);
				} else {
					throw new ValidationError(`Value must between ${rule.min} and ${rule.max}`);
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
function patternSchema(rule) {
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
					throw new ValidationError(`Unmatched rule: ${exp.toString()}`);
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
function anySchema(rule, parentRule) {
	let validators = [];
	if (parentRule.type === string.name) {
		createSubValidators(parentRule, rule.rules, validators, val, min, max, pattern);
	} else if (parentRule.type === number.name) {
		createSubValidators(parentRule, rule.rules, validators, val, min, max, less, more, range);
	} else if (parentRule.type === boolean.name) {
		createSubValidators(parentRule, rule.rules, validators, val);
	}
	if (validators.length < 2) {
		throw new SchemaError('Invalid "any" rule: at least provide two sub rules');
	}
	return (input) => {
		for (let i = 0; i < validators.length; i++) {
			try {
				validators[i](input);
				return;
			} catch {
				null;
			}
		}
		throw new ValidationError('Invalid value: no rule matched');
	};
}


/**
 * @param {ComboRule} rule
 * @param {...RuleMaker} availableRules
 * @returns {Validator}
 */
function createPrimitiveSchema(rule, ...availableRules) {
	let validators = [];
	let mismatchMessage = createSubValidators(rule, rule.rules, validators, ...availableRules);
	return (input) => {
		let inputType = getInputType(input);
		if (inputType !== 'undefined' && input !== null && inputType !== rule.type) {
			if (mismatchMessage) {
				throw new ValidationError(mismatchMessage);
			} else {
				throw new ValidationError(`Unexpected type: require '${rule.type}' but found '${inputType}'`);
			}
		}
		validate(input, validators);
	};
}

function objectSchema(rule) {
	return createPrimitiveSchema(rule, prop, mismatch);
}

function stringSchema(rule) {
	return createPrimitiveSchema(rule, val, min, max, pattern, any, mismatch);
}

function numberSchema(rule) {
	return createPrimitiveSchema(rule, val, min, max, less, more, range, any, mismatch);
}

function arraySchema(rule) {
	return createPrimitiveSchema(rule, min, max, prop, item, mismatch);
}

function booleanSchema(rule) {
	return createPrimitiveSchema(rule, val, mismatch);
}

/**
 * Create validation schema
 * @param {Rule} rule Root rule
 * @returns {Validator}
 */
export function build(rule) {
	return createValidator(rule, [required, object, string, number, array, boolean, union]);
}
