export type merge<O> = { [K in keyof O]: O[K] };

type concatStrings<
	arr extends any[],
	acc extends string = "",
> = arr extends []
	? acc
	: arr extends [infer x extends string]
		? concatStrings<[], `${acc}${x}`>
		: arr extends [
					infer x extends string,
					...infer xs extends string[],
				]
			? concatStrings<xs, `${acc}${x}`>
			: never;

type fns = "print" | "add" | "sub";

type execFn<
	fn extends fns,
	args extends any[],
	ctx extends Record<string, string | number>,
	buffer extends string,
> = fn extends "print"
	? _
	: fn extends "add"
		? _
		: fn extends "sub"
			? _
			: _;

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
> = trimWhitespace<str> extends `<${tag}>${infer content}</${tag}>${infer rest}`
	? [trimWhitespace<content>, trimWhitespace<rest>]
	: never;

type parseFnCall<str extends string> = parseTag<
	str,
	"call"
> extends [
	infer content extends string,
	infer rest extends string,
]
	? parseTag<content, "fn"> extends [
			infer fnName extends string,
			infer fnRest extends string,
		]
		? parseFnCallArgs<fnRest> extends infer args extends
				string[]
			? [[fnName, args], rest]
			: never
		: never
	: never;

type parseFnCallArgs<
	str extends string,
	acc extends string[] = [],
> = str extends "" ? acc : parseTag<str, "">;

type parseLet<str extends string> = parseTag<
	str,
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
					infer _,
				]
				? [[name, type, value], rest]
				: never
			: never
		: never
	: never;

type runBody<
	str extends string,
	ctx extends Record<string, string | number> = {},
	buffer extends string = "",
> = trimWhitespace<str> extends ""
	? merge<ctx>
	: parseLet<str> extends [
				[
					infer name extends string,
					infer type extends "string" | "number",
					infer value extends string,
				],
				infer rest extends string,
			]
		? runBody<
				rest,
				ctx & {
					[K in name]: getValue<type, value>;
				},
				buffer
			>
		: never;

type eval<str extends string> = parseTag<
	str,
	"program"
> extends [infer content extends string, infer _]
	? runBody<content>
	: never;

type result = eval<`
  <program>
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
	</program>
`>;

type _ = result;
