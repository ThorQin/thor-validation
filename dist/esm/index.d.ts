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
interface RequiredRule extends CheckRule {
	rule: PrimitiveRule | UnionRule | null;
}
interface ItemRule extends Rule {
	rule: PrimitiveRule | UnionRule | RequiredRule;
}
interface PropRule extends ItemRule {
	name: string | number;
}
interface Validator {
	(input: unknown): void;
}
export declare class ValidationError extends Error {
	constructor(msg: string);
}
export declare class SchemaError extends Error {
	constructor(msg: string);
}
/**
 * Specified value, only be used as child rule of the primitive type string, number and boolean
 */
export declare function equal(value: number | string | boolean | Date, message?: string | null): EqualRule;
/**
 * Specify minimum value or length, only be used as child rule of the primitive type
 */
export declare function min(value: number, message?: string | null): ValueRule;
/**
 * Specify maximum value or length, only be used as child rule of the primitive type
 */
export declare function max(value: number, message?: string | null): ValueRule;
/**
 * Specify value or length's range, only be used as child rule of the primitive type
 */
export declare function range(min: number, max: number, message?: string | null): RangeRule;
export declare function less(value: number, message?: null): ValueRule;
export declare function more(value: number, message?: null): ValueRule;
export declare function before(value: Date | string, message?: string | null): DateRule;
export declare function after(value: Date | string, message?: string | null): DateRule;
export declare function begin(value: Date | string, message?: string | null): DateRule;
/**
 * @param {string|Date} value
 * @param {string} message
 * @returns {ValueRule}
 */
export declare function end(value: Date | string, message?: string | null): DateRule;
/**
 * Specify date range, only be used as child rule of the date type
 */
export declare function between(begin: Date | string, end: Date | string, message?: string | null): BetweenRule;
/**
 * Specify string pattern, only be used as child rule of the string type
 */
export declare function pattern(regex: RegExp | string, message?: string | null): PatternRule;
/**
 * Specify value must be provided, only be used as child rule of the primitive or group type
 * @param {string} message
 * @param  {...ComboRule} rules
 * @returns {RequiredRule}
 */
export declare function required(
	rule?: PrimitiveRule | UnionRule | string | null,
	message?: string | null
): RequiredRule;
/**
 * Show custom message when type mismatched, only be used as child rule of the primitive or group type
 */
export declare function mismatch(message?: null): MismatchRule;
/**
 * Only be used as child rule of array type
 */
export declare function item(rule: PrimitiveRule | UnionRule | RequiredRule): ItemRule;
/**
 * Only be used as child rule of object type
 */
export declare function prop(name: string | number, rule: PrimitiveRule | UnionRule | RequiredRule): PropRule;
/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 */
export declare function any(...rules: CheckRule[]): AnyRule;
/**
 * That indicate validating should passed when any sub rule matched, can be used as top level rule
 */
export declare function union(...rules: PrimitiveRule[]): UnionRule;
/**
 * Primitive type object, can be used as top level rule
 */
export declare function object(...rules: CheckRule[]): PrimitiveRule;
/**
 * Primitive type number, can be used as top level rule
 */
export declare function boolean(...rules: CheckRule[]): PrimitiveRule;
/**
 * Primitive type number, can be used as top level rule
 */
export declare function number(...rules: CheckRule[]): PrimitiveRule;
/**
 * Primitive type string, can be used as top level rule
 */
export declare function string(...rules: CheckRule[]): PrimitiveRule;
/**
 * Primitive type string, can be used as top level rule
 */
export declare function date(...rules: CheckRule[]): PrimitiveRule;
/**
 * Primitive type array, can be used as top level rule
 */
export declare function array(...rules: CheckRule[]): PrimitiveRule;
export declare class Schema {
	toJSON: () => Rule;
	validate: Validator;
	constructor(rule: RequiredRule | PrimitiveRule | UnionRule);
}
export {};
