/**
 * @typedef {{type: string}} Rule
 * @typedef {Rule & {typeRule: Rule}} ItemRule
 * @typedef {(...param) => Rule} RuleMaker
 * @typedef {Rule & {rules?: Rule[]}} ComboRule
 * @typedef {Rule & {message?: string}} CheckRule
 * @typedef {CheckRule & {min: number, max: number}} RangeRule
 * @typedef {CheckRule & {regex: RegExp}} PatternRule
 * @typedef {CheckRule & {value: number}} ValueRule
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
	array: arraySchema,
	union: unionSchema
};

const PRIMITIVE = {
	object: objectSchema,
	string: stringSchema,
	number: numberSchema,
	array: arraySchema
};

function fill(info, message) {
	if (message) {
		info.message = message.toString();
	}
	return info;
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

/**
 * Specify string pattern, only be used as child rule of the string type
 * @param {RegExp} regex
 * @param {string} message
 * @returns {PatternRule}
 */
export function pattern(regex, message = null) {
	return fill({
		type: 'pattern',
		regex: regex
	}, message);
}

/**
 * Specify value must be provided, only be used as child rule of the primitive or group type
 * @param {string} message
 * @returns {CheckRule}
 */
export function required(message = null) {
	return fill({
		type: 'required'
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
 * @param  {Rule} typeRule
 * @returns {ItemRule}
 */
export function item(typeRule) {
	return {
		type: 'item',
		typeRule: typeRule
	};
}

/**
 * Only be used as child rule of object type
 * @param {string} name
 * @param  {Rule} typeRule
 * @returns {PropRule}
 */
export function prop(name, typeRule) {
	return {
		type: 'prop',
		name: name,
		typeRule: typeRule
	};
}

/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 * @param  {...Rule} rules
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
 * @param  {...Rule} rules
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
 * @param  {...Rule} rules
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
 * @param  {...Rule} rules
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
 * @param  {...Rule} rules
 * @returns {ComboRule}
 */
export function string(...rules) {
	return {
		type: 'string',
		rules: rules
	};
}

/**
 * Primitive type array, can be used as top level rule
 * @param  {...Rule} rules
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
		throw new SchemaError(`Invalid ${parentRule.type}[${i}]: ${e.message}`);
	}
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
	return createPrimitiveSchema(rule, prop, required, mismatch);
}

function stringSchema(rule) {
	return createPrimitiveSchema(rule, min, max, pattern, any, required, mismatch);
}

function numberSchema(rule) {
	return createPrimitiveSchema(rule, min, max, range, any, required, mismatch);
}

function arraySchema(rule) {
	return createPrimitiveSchema(rule, min, max, prop, item, required, mismatch);
}

/**
 * @param {ComboRule} rule
 * @returns {Validator}
 */
function unionSchema(rule) {
	let validators = [];
	let typeValidator = {};
	let rules = rule.rules || [];
	rules.filter(r => r.type in PRIMITIVE).forEach(
		r => typeValidator[r.type] = PRIMITIVE[r.type](r)
	);
	let mismatchRule = rules.find(r => r.type === mismatch.name);
	let mismatchMessage = mismatchRule ? mismatchRule.message : null;
	let requiredRule = rules.find(r => r.type === required.name);
	if (requiredRule) {
		validators.push(requiredSchema(requiredRule));
	}
	if (Object.keys(typeValidator).length < 2) {
		throw new SchemaError('Invalid union type definition, at least provide two types');
	}
	return (input) => {
		let inputType = getInputType(input);
		if (inputType !== 'undefined' && input !== null) {
			let validator = typeValidator[inputType];
			if (!validator) {
				if (mismatchMessage) {
					throw new ValidationError(mismatchMessage);
				} else {
					throw new ValidationError(`Unexpected type: require '${rule.type}' but found '${inputType}'`);
				}
			} else {
				validator(input);
			}
		}
		validate(input, validators);
	};
}


/**
 * @param {PropRule} rule
 * @returns {Validator}
 */
function propSchema(rule) {
	let validators = [];
	createSubValidators(rule, [rule.typeRule], validators, object, string, number, array, union);
	return (input) => {
		try {
			validate(input[rule.name], validators);
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
	let validators = [];
	createSubValidators(rule, [rule.typeRule], validators, object, string, number, array, union);
	return (input) => {
		let i;
		try {
			for (i = 0; i < input.length; i++) {
				validate(input[i], validators);
			}
		} catch (e) {
			throw new ValidationError(`Invalid item [${i}]: ${e.message}`);
		}
	};
}

/**
 * @param {CheckRule} rule
 * @returns {Validator}
 */
function requiredSchema(rule) {
	return (input) => {
		if (typeof input === 'undefined' || input === null) {
			if (rule.message) {
				throw new ValidationError(rule.message);
			} else {
				throw new ValidationError('Cannot be null or undefined');
			}
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
	} else if (state) {
		throw new ValidationError(`${state} than ${rule.value}`);
	} else {
		throw new ValidationError('Cannot be null or undefined');
	}
}

/**
 * @param {ValueRule} rule
 * @returns {Validator}
 */
function minSchema(rule) {
	return (input) => {
		if (typeof input === 'undefined' || input === null) {
			invalidValueMessage(rule);
		}
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input < rule.value || isNaN(input)) {
				invalidValueMessage(rule, 'Value less');
			}
		} else if (inputType === 'string') {
			if (input.length < rule.value) {
				invalidValueMessage(rule, 'String length less');
			}
		} else if (inputType === 'array') {
			if (input.length < rule.value) {
				invalidValueMessage(rule, 'Array length less');
			}
		}
	};
}

/**
 * @param {ValueRule} rule
 * @returns {Validator}
 */
function maxSchema(rule) {
	return (input) => {
		if (typeof input === 'undefined' || input === null) {
			invalidValueMessage(rule);
		}
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input > rule.value || isNaN(input)) {
				invalidValueMessage(rule, 'Value great');
			}
		} else if (inputType === 'string') {
			if (input.length > rule.value) {
				invalidValueMessage(rule, 'String length great');
			}
		} else if (inputType === 'array') {
			if (input.length > rule.value) {
				invalidValueMessage(rule, 'Array length great');
			}
		}
	};
}

/**
 *
 * @param {ValueRule} rule
 * @param {string} state
 * @param {string} what
 */
function invalidRangeMessage(rule, state) {
	if (rule.message) {
		throw new ValidationError(rule.message);
	} else if (state) {
		throw new ValidationError(`${state} must between ${rule.min} and ${rule.max}`);
	} else {
		throw new ValidationError('Cannot be null or undefined');
	}
}

/**
 * @param {RangeRule} rule
 * @returns {Validator}
 */
function rangeSchema(rule) {
	return (input) => {
		if (typeof input === 'undefined' || input === null) {
			invalidRangeMessage(rule);
		}
		let inputType = getInputType(input);
		if (inputType === 'number') {
			if (input < rule.min || input > rule.max || isNaN(input)) {
				invalidRangeMessage(rule, 'Value');
			}
		}
	};
}

/**
 * @param {PatternRule} rule
 * @returns {Validator}
 */
function patternSchema(rule) {
	if (!(rule.regex instanceof RegExp)) {
		throw new SchemaError('Invalid pattern rule: must provide a valid regular expression object');
	}
	return (input) => {
		if (!rule.regex.test(input)) {
			throw new ValidationError(`Unmatched the rule: ${rule.regex.toString()}`);
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
		createSubValidators(rule, rule.rules, validators, min, max, pattern);
	} else if (parentRule.type === number.name) {
		createSubValidators(rule, rule.rules, validators, min, max, range);
	}
	if (validators.length < 2) {
		throw new SchemaError('Invalid "any" rule definition, at least provide two sub rules');
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
		throw new ValidationError('Invalid value: no matching rule is found');
	};
}

/**
 * Create validation schema
 * @param {Rule} rule Root rule
 * @returns {Validator}
 */
export function buildSchema(rule) {
	return createValidator(rule, [object, string, number, array, union]);
}
