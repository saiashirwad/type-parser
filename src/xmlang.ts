export type merge<O> = { [K in keyof O]: O[K] };

type getValue<
	type extends "string" | "number",
	value extends string | number,
> = type extends "number"
	? value extends `${infer value extends number}`
		? value
		: never
	: value;

type trimWhitespace<T extends string> =
	T extends `${" " | "\n" | "\t"}${infer Rest}`
		? trimWhitespace<Rest>
		: T extends `${infer Rest}${" " | "\n" | "\t"}`
			? trimWhitespace<Rest>
			: T;

type parseTag<
	str extends string,
	tag extends string,
> = str extends `<${tag}>${infer content}</${tag}>${infer rest}`
	? [trimWhitespace<content>, trimWhitespace<rest>]
	: never;

type parseLet<str extends string> = parseTag<
	trimWhitespace<str>,
	"let"
> extends [
	infer content extends string,
	infer rest extends string,
]
	? parseTag<content, "name"> extends [
			infer name extends string,
			infer nameRest extends string,
		]
		? parseTag<nameRest, "type"> extends [
				infer type extends "number" | "string",
				infer typeRest extends string,
			]
			? parseTag<typeRest, "value"> extends [
					infer value extends string,
					infer valueRest extends string,
				]
				? [[name, type, value], rest]
				: never
			: never
		: never
	: never;

type parseProgram<
	str extends string,
	acc extends Record<string, string | number> = {},
> = trimWhitespace<str> extends ""
	? merge<acc>
	: parseLet<trimWhitespace<str>> extends [
				[
					infer name extends string,
					infer type extends "string" | "number",
					infer value extends string,
				],
				infer rest extends string,
			]
		? parseProgram<
				rest,
				acc & {
					[K in name]: getValue<type, value>;
				}
			>
		: never;

type result = parseProgram<`
	<let>
		<name>something</name>
		<type>string</type>
		<value>what</value>
	</let>
	<let>
		<name>bar</name>
		<type>string</type>
		<value>what</value>
	</let>
	<let>
			<name>foo</name>
			<type>number</type>
			<value>55</value>
		</let>
`>;
