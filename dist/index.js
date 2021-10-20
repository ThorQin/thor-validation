'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Schema =
	exports.array =
	exports.date =
	exports.string =
	exports.number =
	exports.boolean =
	exports.object =
	exports.union =
	exports.any =
	exports.prop =
	exports.item =
	exports.mismatch =
	exports.need =
	exports.pattern =
	exports.between =
	exports.end =
	exports.begin =
	exports.after =
	exports.before =
	exports.more =
	exports.less =
	exports.range =
	exports.max =
	exports.min =
	exports.equal =
	exports.SchemaError =
	exports.ValidationError =
		void 0;
class ValidationError extends Error {
	constructor(msg) {
		super(msg);
	}
}
exports.ValidationError = ValidationError;
class SchemaError extends Error {
	constructor(msg) {
		super(msg);
	}
}
exports.SchemaError = SchemaError;
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
	need: needRule,
	prop: propRule,
	item: itemRule,
	object: objectRule,
	string: stringRule,
	number: numberRule,
	boolean: booleanRule,
	date: dateRule,
	array: arrayRule,
	union: unionRule,
};
const PRIMITIVE = {
	object: objectRule,
	string: stringRule,
	number: numberRule,
	array: arrayRule,
	boolean: booleanRule,
	date: dateRule,
};
function fill(info, message) {
	if (typeof message === 'string' || typeof message === 'number') {
		info.message = message.toString();
	}
	return info;
}
/**
 * Specified value, only be used as child rule of the primitive type string, number and boolean
 */
function equal(value, message) {
	return fill(
		{
			type: 'equal',
			value: value,
		},
		message
	);
}
exports.equal = equal;
/**
 * Specify minimum value or length, only be used as child rule of the primitive type
 */
function min(value, message) {
	return fill(
		{
			type: 'min',
			value: value,
		},
		message
	);
}
exports.min = min;
/**
 * Specify maximum value or length, only be used as child rule of the primitive type
 */
function max(value, message) {
	return fill(
		{
			type: 'max',
			value: value,
		},
		message
	);
}
exports.max = max;
/**
 * Specify value or length's range, only be used as child rule of the primitive type
 */
function range(min, max, message) {
	return fill(
		{
			type: 'range',
			min: min,
			max: max,
		},
		message
	);
}
exports.range = range;
function less(value, message) {
	return fill(
		{
			type: 'less',
			value: value,
		},
		message
	);
}
exports.less = less;
function more(value, message) {
	return fill(
		{
			type: 'more',
			value: value,
		},
		message
	);
}
exports.more = more;
function before(value, message) {
	return fill(
		{
			type: 'before',
			value: value,
		},
		message
	);
}
exports.before = before;
function after(value, message) {
	return fill(
		{
			type: 'after',
			value: value,
		},
		message
	);
}
exports.after = after;
function begin(value, message) {
	return fill(
		{
			type: 'begin',
			value: value,
		},
		message
	);
}
exports.begin = begin;
/**
 * @param {string|Date} value
 * @param {string} message
 * @returns {ValueRule}
 */
function end(value, message) {
	return fill(
		{
			type: 'end',
			value: value,
		},
		message
	);
}
exports.end = end;
/**
 * Specify date range, only be used as child rule of the date type
 */
function between(begin, end, message) {
	return fill(
		{
			type: 'between',
			begin: begin,
			end: end,
		},
		message
	);
}
exports.between = between;
/**
 * Specify string pattern, only be used as child rule of the string type
 */
function pattern(regex, message) {
	return fill(
		{
			type: 'pattern',
			regex: regex instanceof RegExp ? regex.toString() : regex,
		},
		message
	);
}
exports.pattern = pattern;
/**
 * Specify value must be provided, only be used as child rule of the primitive or group type
 * @param {string} message
 * @param  {...ComboRule} rules
 * @returns {NeedRule}
 */
function need(rule = null, message) {
	if (typeof rule === 'string') {
		message = rule;
		rule = null;
	}
	return fill(
		{
			type: 'need',
			rule: rule,
		},
		message
	);
}
exports.need = need;
/**
 * Show custom message when type mismatched, only be used as child rule of the primitive or group type
 */
function mismatch(message) {
	return fill(
		{
			type: 'mismatch',
		},
		message
	);
}
exports.mismatch = mismatch;
/**
 * Only be used as child rule of array type
 */
function item(rule) {
	return {
		type: 'item',
		rule: rule,
	};
}
exports.item = item;
/**
 * Only be used as child rule of object type
 */
function prop(name, rule) {
	return {
		type: 'prop',
		name: name,
		rule: rule,
	};
}
exports.prop = prop;
/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 */
function any(...rules) {
	return {
		type: 'any',
		rules: rules,
	};
}
exports.any = any;
/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 */
function union(...rules) {
	return {
		type: 'union',
		rules: rules,
	};
}
exports.union = union;
/**
 * Primitive type object, can be used as top level rule
 */
function object(...rules) {
	return {
		type: 'object',
		rules: rules,
	};
}
exports.object = object;
/**
 * Primitive type number, can be used as top level rule
 */
function boolean(...rules) {
	return {
		type: 'boolean',
		rules: rules,
	};
}
exports.boolean = boolean;
/**
 * Primitive type number, can be used as top level rule
 */
function number(...rules) {
	return {
		type: 'number',
		rules: rules,
	};
}
exports.number = number;
/**
 * Primitive type string, can be used as top level rule
 */
function string(...rules) {
	return {
		type: 'string',
		rules: rules,
	};
}
exports.string = string;
/**
 * Primitive type string, can be used as top level rule
 */
function date(...rules) {
	return {
		type: 'date',
		rules: rules,
	};
}
exports.date = date;
/**
 * Primitive type array, can be used as top level rule
 */
function array(...rules) {
	return {
		type: 'array',
		rules: rules,
	};
}
exports.array = array;
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
function validate(input, validators) {
	validators.forEach((validator) => {
		validator(input);
	});
}
function createValidator(rule, availableRules, parentRule) {
	if (!rule || !rule.type) {
		throw new SchemaError(`Invalid rule: cannot be '${typeof rule}'`);
	}
	if (!availableRules.find((r) => r === rule.type)) {
		throw new SchemaError(`Unexpected rule: '${rule.type}'`);
	}
	return RULES[rule.type](rule, parentRule);
}
function createSubValidators(parentRule, subRules, validators, ...availableRules) {
	let mismatchMessage = null;
	let i = 0;
	const rules = subRules || [];
	try {
		for (i = 0; i < rules.length; i++) {
			const r = rules[i];
			if (r.type === mismatch.name) {
				if (!availableRules.find((ar) => ar === r.type)) {
					throw new SchemaError(`Unexpected rule: '${r.type}'`);
				}
				mismatchMessage = r.message;
			} else {
				validators.push(createValidator(r, availableRules, parentRule));
			}
		}
		return mismatchMessage || null;
	} catch (e) {
		throw new SchemaError(`Invalid "${parentRule.type}" rule (sub rule ${i + 1}):\n    > ${e.message}`);
	}
}
function propRule(rule) {
	if (!rule.rule || typeof rule.rule !== 'object' || typeof rule.rule.type !== 'string') {
		throw new SchemaError('Invalid "prop" rule: must provide a sub rule');
	}
	if (!rule.name && rule.name !== 0) {
		throw new SchemaError('Invalid "prop" rule: "name" must be a valid key or index');
	}
	let validator;
	try {
		validator = createValidator(rule.rule, [
			need.name,
			object.name,
			string.name,
			number.name,
			array.name,
			boolean.name,
			date.name,
			union.name,
		]);
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
function itemRule(rule) {
	if (!rule.rule || typeof rule.rule !== 'object' || typeof rule.rule.type !== 'string') {
		throw new SchemaError('Invalid "item" rule: must provide a sub rule');
	}
	let validator;
	try {
		validator = createValidator(rule.rule, [
			need.name,
			object.name,
			string.name,
			number.name,
			array.name,
			boolean.name,
			date.name,
			union.name,
		]);
	} catch (e) {
		throw new SchemaError(`Invalid "item" rule:\n    > ${e.message}`);
	}
	return (input) => {
		let i = 0;
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
function needRule(rule) {
	let validator = null;
	if (rule.rule) {
		try {
			validator = createValidator(rule.rule, [
				object.name,
				string.name,
				number.name,
				array.name,
				boolean.name,
				date.name,
				union.name,
			]);
		} catch (e) {
			throw new SchemaError(`Invalid "need" rule:\n    > ${e.message}`);
		}
	}
	return (input) => {
		if (typeof input === 'undefined' || input === null) {
			if (rule.message) {
				throw new ValidationError(rule.message);
			} else {
				throw new ValidationError('value is need');
			}
		}
		if (validator) {
			validator(input);
		}
	};
}
/**
 * @throws ValidationError
 */
function invalidValueMessage(rule, state) {
	if (rule.message) {
		throw new ValidationError(rule.message);
	} else {
		throw new ValidationError(`${state} ${rule.value}`);
	}
}
function equalRule(rule, parentRule) {
	function invalidType() {
		throw new SchemaError(`Invalid "equal" rule: "value" property must be a valid ${parentRule.type}`);
	}
	const valType = getInputType(rule.value);
	if (parentRule.type === 'date') {
		if (valType === 'string') {
			if (isNaN(new Date(rule.value).getTime())) {
				invalidType();
			}
		} else if (parentRule.type !== valType) {
			invalidType();
		} else if (isNaN(rule.value.getTime())) {
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
function dateRuleBase(rule, compare, msg) {
	function invalidType() {
		throw new SchemaError(`Invalid "${rule.type}" rule: "value" property must be a valid date`);
	}
	const valType = getInputType(rule.value);
	if (valType === 'string') {
		if (isNaN(new Date(rule.value).getTime())) {
			invalidType();
		}
	} else if (valType !== 'date' || isNaN(rule.value.getTime())) {
		invalidType();
	}
	return (input) => {
		const inputType = getInputType(input);
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
		const inputType = getInputType(input);
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
function betweenRule(rule) {
	function invalidType(prop) {
		throw new SchemaError(`Invalid "between" rule: "${prop}" property must be a valid date`);
	}
	function checkProp(prop) {
		if (!(rule[prop] instanceof Date)) {
			if (typeof rule[prop] === 'string') {
				const dt = new Date(rule[prop]);
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
	const begin = checkProp('begin');
	const end = checkProp('end');
	if (begin.getTime() >= end.getTime()) {
		throw new SchemaError('Invalid "between" rule: "begin" property must be ealier or equal to "end" property');
	}
	return (input) => {
		const inputType = getInputType(input);
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
function patternRule(rule) {
	let exp;
	if (rule.regex instanceof RegExp) {
		exp = rule.regex;
	} else if (typeof rule.regex === 'string') {
		try {
			const m = rule.regex.match(/^\/(.+)\/(.*)$/);
			if (!m) {
				throw new SchemaError(PATTERN_ERR_MSG);
			}
			const pat = m[1];
			const flag = m[2];
			exp = new RegExp(pat, flag || undefined);
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
function anyRule(rule, parentRule) {
	const validators = [];
	if (parentRule.type === string.name) {
		createSubValidators(parentRule, rule.rules, validators, equal.name, min.name, max.name, pattern.name);
	} else if (parentRule.type === number.name) {
		createSubValidators(
			parentRule,
			rule.rules,
			validators,
			equal.name,
			min.name,
			max.name,
			less.name,
			more.name,
			range.name
		);
	} else if (parentRule.type === boolean.name) {
		createSubValidators(parentRule, rule.rules, validators, equal.name);
	} else if (parentRule.type === date.name) {
		createSubValidators(
			parentRule,
			rule.rules,
			validators,
			equal.name,
			begin.name,
			end.name,
			before.name,
			after.name,
			between.name
		);
	}
	if (validators.length < 2) {
		throw new SchemaError('Invalid "any" rule: at least provide two sub rules');
	}
	return (input) => {
		const errors = [];
		for (let i = 0; i < validators.length; i++) {
			try {
				validators[i](input);
				return;
			} catch (e) {
				errors.push(e.message);
			}
		}
		if (errors.length === 1) {
			throw new ValidationError(errors[0]);
		} else {
			const msg = errors.map((e, i) => `${i + 1}. ${e}`).join(', ');
			throw new ValidationError(`not eligible: (${msg})`);
		}
	};
}
function createPrimitiveRule(rule, ...availableRules) {
	const validators = [];
	const mismatchMessage = createSubValidators(rule, rule.rules, validators, ...availableRules);
	function throwMismatch(inputType) {
		if (mismatchMessage) {
			throw new ValidationError(mismatchMessage);
		} else {
			throw new ValidationError(`Unexpected type: require '${rule.type}' but found '${inputType}'`);
		}
	}
	return (input) => {
		const inputType = getInputType(input);
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
			validate(input, validators);
		}
	};
}
function objectRule(rule) {
	return createPrimitiveRule(rule, prop.name, mismatch.name);
}
function stringRule(rule) {
	return createPrimitiveRule(rule, equal.name, min.name, max.name, pattern.name, any.name, mismatch.name);
}
function numberRule(rule) {
	return createPrimitiveRule(
		rule,
		equal.name,
		min.name,
		max.name,
		less.name,
		more.name,
		range.name,
		any.name,
		mismatch.name
	);
}
function arrayRule(rule) {
	return createPrimitiveRule(rule, min.name, max.name, prop.name, item.name, mismatch.name);
}
function booleanRule(rule) {
	return createPrimitiveRule(rule, equal.name, mismatch.name);
}
function dateRule(rule) {
	return createPrimitiveRule(
		rule,
		equal.name,
		begin.name,
		end.name,
		before.name,
		after.name,
		between.name,
		any.name,
		mismatch.name
	);
}
const UNION = { object, string, number, array, boolean, date, mismatch };
function unionRule(rule) {
	const typeValidator = {};
	const rules = rule.rules || [];
	try {
		rules.forEach((r) => {
			if (!r || !r.type) {
				throw new SchemaError(`Invalid rule: cannot be '${typeof r}'`);
			}
			if (!(r.type in UNION)) {
				throw new SchemaError(`Unexpected rule: ${r.type}`);
			}
		});
		rules.filter((r) => r.type in PRIMITIVE).forEach((r) => (typeValidator[r.type] = PRIMITIVE[r.type](r)));
	} catch (e) {
		throw new SchemaError(`Invalid "union" rule:\n    > ${e.message}`);
	}
	const mismatchRule = rules.find((r) => r.type === mismatch.name);
	const mismatchMessage = mismatchRule ? mismatchRule.message : null;
	const supportTypes = Object.keys(typeValidator);
	if (supportTypes.length < 2) {
		throw new SchemaError('Invalid "union" rule, at least provide two different types');
	}
	return (input) => {
		const inputType = getInputType(input);
		if (inputType !== 'undefined' && input !== null) {
			const validators = [];
			for (const type of supportTypes) {
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
					throw new ValidationError(
						`Unexpected type: can be '${supportTypes.toString().replace(',', ', ')}' but found '${inputType}'`
					);
				}
			}
			const errors = [];
			for (const validator of validators) {
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
				const msg = errors.map((e, i) => `R${i + 1}. ${e}`).join('; ');
				throw new ValidationError(`No rule matched: [${msg}]`);
			}
		}
	};
}
class Schema {
	constructor(rule) {
		this.toJSON = () => {
			return rule;
		};
		this.toString = () => {
			return JSON.stringify(rule, null, 2);
		};
		this.validate = createValidator(rule, [
			need.name,
			object.name,
			string.name,
			number.name,
			array.name,
			boolean.name,
			date.name,
			union.name,
		]);
	}
}
exports.Schema = Schema;
//# sourceMappingURL=index.js.map
