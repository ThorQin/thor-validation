interface Rule {
	type: string;
}

interface CheckRule extends Rule {
	message?: string;
}

interface MismatchRule extends CheckRule {
	type: 'mismatch';
}

interface ValueRule extends CheckRule {
	value: number;
}

interface DateRule extends CheckRule {
	value: string | Date;
}

interface EqualRule extends CheckRule {
	value: boolean | number | string | Date;
}

interface RangeRule extends CheckRule {
	min: number;
	max: number;
}

interface BetweenRule extends CheckRule {
	begin: string | Date;
	end: string | Date;
}

interface PatternRule extends CheckRule {
	regex: string | RegExp;
}

interface AnyRule extends Rule {
	rules: CheckRule[];
}

interface PrimitiveRule extends Rule {
	rules: (CheckRule | AnyRule)[];
}

interface UnionRule extends Rule {
	rules: (PrimitiveRule | MismatchRule)[];
}

interface NeedRule extends CheckRule {
	rule: PrimitiveRule | UnionRule | null;
}

interface ItemRule extends Rule {
	rule: PrimitiveRule | UnionRule | NeedRule;
}

interface PropRule extends ItemRule {
	name: string | number;
}

interface Validator {
	(input: unknown): void;
}

type RuleMaker = (rule: Rule, parentRule?: Rule) => Validator;

export class ValidationError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

export class SchemaError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

const RULES: { [key: string]: RuleMaker | null } = {
	mismatch: null,
	equal: equalRule as RuleMaker,
	min: minRule as RuleMaker,
	max: maxRule as RuleMaker,
	less: lessRule as RuleMaker,
	more: moreRule as RuleMaker,
	before: beforeRule as RuleMaker,
	after: afterRule as RuleMaker,
	begin: beginRule as RuleMaker,
	end: endRule as RuleMaker,
	range: rangeRule as RuleMaker,
	between: betweenRule as RuleMaker,
	pattern: patternRule as RuleMaker,
	any: anyRule as RuleMaker,
	need: needRule as RuleMaker,
	prop: propRule as RuleMaker,
	item: itemRule as RuleMaker,
	object: objectRule as RuleMaker,
	string: stringRule as RuleMaker,
	number: numberRule as RuleMaker,
	boolean: booleanRule as RuleMaker,
	date: dateRule as RuleMaker,
	array: arrayRule as RuleMaker,
	union: unionRule as RuleMaker,
};

const PRIMITIVE: { [key: string]: RuleMaker } = {
	object: objectRule as RuleMaker,
	string: stringRule as RuleMaker,
	number: numberRule as RuleMaker,
	array: arrayRule as RuleMaker,
	boolean: booleanRule as RuleMaker,
	date: dateRule as RuleMaker,
};

function fill<T extends CheckRule>(info: T, message?: string | number | null): T {
	if (typeof message === 'string' || typeof message === 'number') {
		info.message = message.toString();
	}
	return info;
}

/**
 * Specified value, only be used as child rule of the primitive type string, number and boolean
 */
export function equal(value: number | string | boolean | Date, message?: string): EqualRule {
	return fill(
		{
			type: 'equal',
			value: value,
		},
		message
	);
}

/**
 * Specify minimum value or length, only be used as child rule of the primitive type
 */
export function min(value: number, message?: string): ValueRule {
	return fill(
		{
			type: 'min',
			value: value,
		},
		message
	);
}

/**
 * Specify maximum value or length, only be used as child rule of the primitive type
 */
export function max(value: number, message?: string): ValueRule {
	return fill(
		{
			type: 'max',
			value: value,
		},
		message
	);
}

/**
 * Specify value or length's range, only be used as child rule of the primitive type
 */
export function range(min: number, max: number, message?: string): RangeRule {
	return fill(
		{
			type: 'range',
			min: min,
			max: max,
		},
		message
	);
}

export function less(value: number, message?: string): ValueRule {
	return fill(
		{
			type: 'less',
			value: value,
		},
		message
	);
}

export function more(value: number, message?: string): ValueRule {
	return fill(
		{
			type: 'more',
			value: value,
		},
		message
	);
}

export function before(value: Date | string, message?: string): DateRule {
	return fill(
		{
			type: 'before',
			value: value,
		},
		message
	);
}

export function after(value: Date | string, message?: string): DateRule {
	return fill(
		{
			type: 'after',
			value: value,
		},
		message
	);
}

export function begin(value: Date | string, message?: string): DateRule {
	return fill(
		{
			type: 'begin',
			value: value,
		},
		message
	);
}

/**
 * @param {string|Date} value
 * @param {string} message
 * @returns {ValueRule}
 */
export function end(value: Date | string, message?: string): DateRule {
	return fill(
		{
			type: 'end',
			value: value,
		},
		message
	);
}

/**
 * Specify date range, only be used as child rule of the date type
 */
export function between(begin: Date | string, end: Date | string, message?: string): BetweenRule {
	return fill(
		{
			type: 'between',
			begin: begin,
			end: end,
		},
		message
	);
}

/**
 * Specify string pattern, only be used as child rule of the string type
 */
export function pattern(regex: RegExp | string, message?: string): PatternRule {
	return fill(
		{
			type: 'pattern',
			regex: regex instanceof RegExp ? regex.toString() : regex,
		},
		message
	);
}

/**
 * Specify value must be provided, only be used as child rule of the primitive or group type
 * @param {string} message
 * @param  {...ComboRule} rules
 * @returns {NeedRule}
 */
export function need(rule: PrimitiveRule | UnionRule | string | null = null, message?: string): NeedRule {
	if (typeof rule === 'string') {
		message = rule;
		rule = null;
	}
	return fill(
		{
			type: 'need',
			rule: rule as PrimitiveRule | UnionRule | null,
		},
		message
	);
}

/**
 * Show custom message when type mismatched, only be used as child rule of the primitive or group type
 */
export function mismatch(message?: string): MismatchRule {
	return fill(
		{
			type: 'mismatch',
		},
		message
	);
}

/**
 * Only be used as child rule of array type
 */
export function item(rule: PrimitiveRule | UnionRule | NeedRule): ItemRule {
	return {
		type: 'item',
		rule: rule,
	};
}

/**
 * Only be used as child rule of object type
 */
export function prop(name: string | number, rule: PrimitiveRule | UnionRule | NeedRule): PropRule {
	return {
		type: 'prop',
		name: name,
		rule: rule,
	};
}

/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 */
export function any(...rules: CheckRule[]): AnyRule {
	return {
		type: 'any',
		rules: rules,
	};
}

/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 */
export function union(...rules: PrimitiveRule[]): UnionRule {
	return {
		type: 'union',
		rules: rules,
	};
}

/**
 * Primitive type object, can be used as top level rule
 */
export function object(...rules: CheckRule[]): PrimitiveRule {
	return {
		type: 'object',
		rules: rules,
	};
}

/**
 * Primitive type number, can be used as top level rule
 */
export function boolean(...rules: CheckRule[]): PrimitiveRule {
	return {
		type: 'boolean',
		rules: rules,
	};
}

/**
 * Primitive type number, can be used as top level rule
 */
export function number(...rules: CheckRule[]): PrimitiveRule {
	return {
		type: 'number',
		rules: rules,
	};
}

/**
 * Primitive type string, can be used as top level rule
 */
export function string(...rules: CheckRule[]): PrimitiveRule {
	return {
		type: 'string',
		rules: rules,
	};
}

/**
 * Primitive type string, can be used as top level rule
 */
export function date(...rules: CheckRule[]): PrimitiveRule {
	return {
		type: 'date',
		rules: rules,
	};
}

/**
 * Primitive type array, can be used as top level rule
 */
export function array(...rules: CheckRule[]): PrimitiveRule {
	return {
		type: 'array',
		rules: rules,
	};
}

//////////////////////////////////////////////////

function getInputType(input: unknown): string {
	let inputType: string = typeof input;
	if (inputType === 'object' && input instanceof Array) {
		inputType = 'array';
	} else if (inputType === 'object' && input instanceof Date) {
		inputType = 'date';
	}
	return inputType;
}

function validate(input: unknown, validators: Validator[]) {
	validators.forEach((validator) => {
		validator(input);
	});
}

function createValidator(rule: Rule, availableRules: string[], parentRule?: Rule): Validator {
	if (!rule || !rule.type) {
		throw new SchemaError(`Invalid rule: cannot be '${typeof rule}'`);
	}
	if (!availableRules.find((r) => r === rule.type)) {
		throw new SchemaError(`Unexpected rule: '${rule.type}'`);
	}
	return (RULES[rule.type] as RuleMaker)(rule, parentRule);
}

function createSubValidators(
	parentRule: PrimitiveRule,
	subRules: CheckRule[],
	validators: Validator[],
	...availableRules: string[]
): string | null {
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
	} catch (e: any) {
		throw new SchemaError(`Invalid "${parentRule.type}" rule (sub rule ${i + 1}):\n    > ${e.message ?? e}`);
	}
}

function propRule(rule: PropRule): Validator {
	if (!rule.rule || typeof rule.rule !== 'object' || typeof rule.rule.type !== 'string') {
		throw new SchemaError('Invalid "prop" rule: must provide a sub rule');
	}
	if (!rule.name && rule.name !== 0) {
		throw new SchemaError('Invalid "prop" rule: "name" must be a valid key or index');
	}
	let validator: Validator;
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
	} catch (e: any) {
		throw new SchemaError(`Invalid "prop" rule of "${rule.name}":\n    > ${e.message ?? e}`);
	}
	return (input) => {
		try {
			if (typeof input === 'object' && input !== null) {
				validator((input as { [key: string]: unknown })[rule.name]);
			}
		} catch (e: any) {
			throw new ValidationError(`Invalid property "${rule.name}": ${e.message ?? e}`);
		}
	};
}

function itemRule(rule: ItemRule): Validator {
	if (!rule.rule || typeof rule.rule !== 'object' || typeof rule.rule.type !== 'string') {
		throw new SchemaError('Invalid "item" rule: must provide a sub rule');
	}
	let validator: Validator;
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
	} catch (e: any) {
		throw new SchemaError(`Invalid "item" rule:\n    > ${e.message ?? e}`);
	}
	return (input) => {
		let i = 0;
		try {
			if (input instanceof Array) {
				for (i = 0; i < input.length; i++) {
					validator(input[i]);
				}
			}
		} catch (e: any) {
			throw new ValidationError(`Invalid item [${i}]: ${e.message ?? e}`);
		}
	};
}

function needRule(rule: NeedRule): Validator {
	let validator: Validator | null = null;
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
		} catch (e: any) {
			throw new SchemaError(`Invalid "need" rule:\n    > ${e.message ?? e}`);
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
function invalidValueMessage(rule: ValueRule | DateRule, state: string): void {
	if (rule.message) {
		throw new ValidationError(rule.message);
	} else {
		throw new ValidationError(`${state} ${rule.value}`);
	}
}

function equalRule(rule: ValueRule | DateRule, parentRule: Rule): Validator {
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
		} else if (isNaN((rule.value as Date).getTime())) {
			invalidType();
		}
	} else if (parentRule.type !== valType || (valType === 'number' && isNaN(rule.value as number))) {
		invalidType();
	}
	return (input) => {
		if (parentRule.type === getInputType(input)) {
			if (parentRule.type === 'date') {
				if ((input as Date).getTime() !== new Date(rule.value).getTime()) {
					invalidValueMessage(rule, 'must be');
				}
			} else if (input !== rule.value) {
				invalidValueMessage(rule, 'must be');
			}
		}
	};
}

interface Comparator<T> {
	(input: T, targetValue: T): boolean;
}

function valueRuleBase(rule: ValueRule, parentRule: Rule, compare: Comparator<number>, msg: string): Validator {
	if (!(typeof rule.value === 'number') || isNaN(rule.value)) {
		throw new SchemaError(`Invalid "${rule.type}" rule: "value" property must be a valid number`);
	}
	return (input) => {
		if (parentRule.type === 'number') {
			if (compare(input as number, rule.value) || isNaN(input as number)) {
				invalidValueMessage(rule, `value ${msg}`);
			}
		} else if (parentRule.type === 'string') {
			if (compare((input as string).length, rule.value)) {
				invalidValueMessage(rule, `string length ${msg}`);
			}
		} else if (parentRule.type === 'array') {
			if (compare((input as unknown[]).length, rule.value)) {
				invalidValueMessage(rule, `array length ${msg}`);
			}
		}
	};
}

function minRule(rule: ValueRule, parentRule: Rule): Validator {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input < targetValue, 'must be greater or equal to');
}

function maxRule(rule: ValueRule, parentRule: Rule): Validator {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input > targetValue, 'must be less or equal to');
}

function lessRule(rule: ValueRule, parentRule: Rule): Validator {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input >= targetValue, 'must be less than');
}

function moreRule(rule: ValueRule, parentRule: Rule): Validator {
	return valueRuleBase(rule, parentRule, (input, targetValue) => input <= targetValue, 'must be greater than');
}

function dateRuleBase(rule: DateRule, compare: Comparator<number>, msg: string): Validator {
	function invalidType() {
		throw new SchemaError(`Invalid "${rule.type}" rule: "value" property must be a valid date`);
	}
	const valType = getInputType(rule.value);
	if (valType === 'string') {
		if (isNaN(new Date(rule.value).getTime())) {
			invalidType();
		}
	} else if (valType !== 'date' || isNaN((rule.value as Date).getTime())) {
		invalidType();
	}
	return (input) => {
		const inputType = getInputType(input);
		if (inputType === 'date') {
			if (compare((input as Date).getTime(), new Date(rule.value).getTime())) {
				invalidValueMessage(rule, msg);
			}
		}
	};
}

function beforeRule(rule: DateRule): Validator {
	return dateRuleBase(rule, (input, targetValue) => input >= targetValue, 'Date must earlier to');
}

function afterRule(rule: DateRule): Validator {
	return dateRuleBase(rule, (input, targetValue) => input <= targetValue, 'Date must later to');
}

function beginRule(rule: DateRule): Validator {
	return dateRuleBase(rule, (input, targetValue) => input < targetValue, 'Date must later or equal to');
}

function endRule(rule: DateRule): Validator {
	return dateRuleBase(rule, (input, targetValue) => input > targetValue, 'Date must earlier or equal to');
}

function rangeRule(rule: RangeRule): Validator {
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
			if ((input as number) < rule.min || (input as number) > rule.max || isNaN(input as number)) {
				if (rule.message) {
					throw new ValidationError(rule.message);
				} else {
					throw new ValidationError(`Value must between ${rule.min} to ${rule.max}`);
				}
			}
		}
	};
}

function betweenRule(rule: BetweenRule): Validator {
	function invalidType(prop: string): never {
		throw new SchemaError(`Invalid "between" rule: "${prop}" property must be a valid date`);
	}
	function checkProp(prop: 'begin' | 'end'): Date {
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
			if (isNaN((rule[prop] as Date).getTime())) {
				invalidType(prop);
			} else {
				return rule[prop] as Date;
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
			if ((input as Date).getTime() < begin.getTime() || (input as Date).getTime() > end.getTime()) {
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

function patternRule(rule: PatternRule): Validator {
	let exp: RegExp;
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
		} catch (e: any) {
			throw new SchemaError(PATTERN_ERR_MSG + ': ' + (e.message ?? e + ''));
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

function anyRule(rule: AnyRule, parentRule: PrimitiveRule): Validator {
	const validators: Validator[] = [];
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
			} catch (e: any) {
				errors.push(e.message ?? e + '');
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

function createPrimitiveRule(rule: PrimitiveRule, ...availableRules: string[]): Validator {
	const validators: Validator[] = [];
	const mismatchMessage = createSubValidators(rule, rule.rules, validators, ...availableRules);
	function throwMismatch(inputType: string): never {
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
				input = new Date(input as string | Date);
				if (isNaN((input as Date).getTime())) {
					throwMismatch(inputType);
				}
			} else if (inputType !== rule.type) {
				throwMismatch(inputType);
			} else if (inputType === 'date' && isNaN((input as Date).getTime())) {
				throwMismatch('invalid date');
			} else if (inputType === 'number' && isNaN(input as number)) {
				throwMismatch('invalid number');
			}
			validate(input, validators);
		}
	};
}

function objectRule(rule: PrimitiveRule): Validator {
	return createPrimitiveRule(rule, prop.name, mismatch.name);
}

function stringRule(rule: PrimitiveRule): Validator {
	return createPrimitiveRule(rule, equal.name, min.name, max.name, pattern.name, any.name, mismatch.name);
}

function numberRule(rule: PrimitiveRule): Validator {
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

function arrayRule(rule: PrimitiveRule): Validator {
	return createPrimitiveRule(rule, min.name, max.name, prop.name, item.name, mismatch.name);
}

function booleanRule(rule: PrimitiveRule): Validator {
	return createPrimitiveRule(rule, equal.name, mismatch.name);
}

function dateRule(rule: PrimitiveRule): Validator {
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

function unionRule(rule: UnionRule): Validator {
	const typeValidator: { [key: string]: Validator } = {};
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
	} catch (e: any) {
		throw new SchemaError(`Invalid "union" rule:\n    > ${e.message ?? e}`);
	}
	const mismatchRule = rules.find((r) => r.type === mismatch.name) as MismatchRule;
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
				} else if (type === 'date' && inputType === 'string' && !isNaN(new Date(input as string).getTime())) {
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
				} catch (e: any) {
					errors.push(e.message ?? e + '');
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

export class Schema {
	toJSON: () => Rule;
	validate: Validator;
	constructor(rule: NeedRule | PrimitiveRule | UnionRule) {
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
