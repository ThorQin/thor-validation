interface Rule {
	type: string;
};

type CheckRule = Rule & {
	message?: string;
}

type ValueRule = CheckRule & {
	value: number;
};

type DateRule = CheckRule & {
	value: string|Date;
};

type EqualRule = CheckRule & {
	value: boolean|number|string|Date;
};

type BetweenRule = CheckRule & {
	begin: string|Date;
	end: string|Date;
};

type PatternRule = CheckRule & {
	regex: string;
};

type AnyRule = Rule & {
	rules: CheckRule[];
};

type PrimitiveRule = Rule & {
	rules: CheckRule[] | AnyRule[];
};


type UnionRule = Rule & {
	rules: PrimitiveRule[];
};


type RequiredRule = CheckRule & {
	rules: PrimitiveRule[] | UnionRule[];
};

type ItemRule = {
	rules: PrimitiveRule[] | UnionRule[];
}

type PropRule = { name: string } & ItemRule;


export function mismatch(message?: string): CheckRule;
/**
 * Input must equal to specified value
 */
export function equal(value: number|string|Date|boolean, message?: string): EqualRule;

/**
 * Input value must greater than or equal to specified value
 */
export function min(value: number, message?: string): ValueRule;

/**
 * Input value must less than or equal to specified value
 */
export function max(value: number, message?: string): ValueRule;

/**
 * Input value must less than specified value
 */
export function less(value: number, message?: string): ValueRule;
/**
 * Input value must greater than specified value
 */
export function more(value: number, message?: string): ValueRule;

/**
 * Input value must between 'min' value to 'max' value
 */
export function range(min: number, max: number, message?: string): RangeRule;

/**
 * Input date must later than or equal to specified date
 */
export function begin(value: string|Date, message?: string): DateRule;

/**
 * Input date must earlier than or equal to specified date
 */
export function end(value: string|Date, message?: string): DateRule;

/**
 * Input date must earlier than specified date
 */
export function before(value: string|Date, message?: string): DateRule;

/**
 * Input date must later than specified date
 */
export function after(value: string|Date, message?: string): DateRule;

/**
 * Input date must between 'begin' time and 'end' time
 */
export function between(begin: string|Date, end: string|Date, message?: string): BetweenRule;

/**
 * Input string must match specified regular expression
 */
export function pattern(regex: string|RegExp, message?: string): PatternRule;

/**
 * Combine checking conditions, if have the any of condition passed then regarded as validation successful
 */
export function any(...rules: CheckRule): AnyRule;

/**
 * Means value are required, only accept one primitive type rule as sub rule.
 */
export function required(message?: string, rule?: PrimitiveRule): RequiredRule;

/**
 * Array primitive type rule's sub rule, only accept one primitive type rule as sub rule.
 */
export function item(rule: PrimitiveRule): ItemRule;

/**
 * Object primitive type rule's sub rule, only accept one primitive type rule as sub rule.
 */
export function prop(name: string, rule: PrimitiveRule): PropRule;

/**
 * Object primitive type rule
 */
export function object(...rules: CheckRule | AnyRule): PrimitiveRule;

/**
 * String primitive type rule
 */
export function string(...rules: CheckRule | AnyRule): PrimitiveRule;

/**
 * Number primitive type rule
 */
export function number(...rules: CheckRule | AnyRule): PrimitiveRule;

/**
 * Boolean primitive type rule
 */
export function boolean(...rules: CheckRule | AnyRule): PrimitiveRule;

/**
 * Date primitive type rule
 */
export function date(...rules: CheckRule | AnyRule): PrimitiveRule;

/**
 * Array primitive type rule
 */
export function array(...rules: CheckRule | AnyRule): PrimitiveRule;

/**
 * Union type rule, can combine primitive type rule to indicate the value may be multiple types
 */
export function union(...rules: PrimitiveRule): UnionRule;

export class ValidationError extends Error {}

export class SchemaError extends Error {}

interface Validator {
	(input: any): void;
}

export class Schema {
	constructor(rule: PrimitiveRule | UnionRule | RequiredRule);
	validate(input: any): void;
}
