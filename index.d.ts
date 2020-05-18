interface Rule {
	type: string;
}

interface CheckRule extends Rule {
	message?: string;
}

interface ValueRule extends CheckRule {
	value: number;
}

interface DateRule extends CheckRule {
	value: string|Date;
}

interface EqualRule extends CheckRule {
	value: boolean|number|string|Date;
}

interface RangeRule extends CheckRule {
	min: number;
	max: number;
}

interface BetweenRule extends CheckRule {
	begin: string|Date;
	end: string|Date;
}

interface PatternRule extends CheckRule {
	regex: string;
}

interface AnyRule extends Rule {
	rules: CheckRule[];
}

interface PrimitiveRule extends Rule {
	rules: CheckRule[] | AnyRule[];
}


interface UnionRule extends Rule {
	rules: PrimitiveRule[];
}

interface RequiredRule extends CheckRule {
	rules: PrimitiveRule[] | UnionRule[];
}

interface ItemRule extends Rule {
	rules: PrimitiveRule[] | UnionRule[];
}

interface PropRule extends ItemRule {
	 name: string
}


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
export function any(...rules: CheckRule[]): AnyRule;

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


type CheckOrAnyRule = CheckRule | AnyRule;

/**
 * Object primitive type rule
 */
export function object(...rules: CheckOrAnyRule[]): PrimitiveRule;

/**
 * String primitive type rule
 */
export function string(...rules: CheckOrAnyRule[]): PrimitiveRule;

/**
 * Number primitive type rule
 */
export function number(...rules: CheckOrAnyRule[]): PrimitiveRule;

/**
 * Boolean primitive type rule
 */
export function boolean(...rules: CheckOrAnyRule[]): PrimitiveRule;

/**
 * Date primitive type rule
 */
export function date(...rules: CheckOrAnyRule[]): PrimitiveRule;

/**
 * Array primitive type rule
 */
export function array(...rules: CheckOrAnyRule[]): PrimitiveRule;

/**
 * Union type rule, can combine primitive type rule to indicate the value may be multiple types
 */
export function union(...rules: PrimitiveRule[]): UnionRule;

export class ValidationError extends Error {}

export class SchemaError extends Error {}

interface Validator {
	(input: any): void;
}

export class Schema {
	constructor(rule: PrimitiveRule | UnionRule | RequiredRule);
	validate(input: any): void;
}
