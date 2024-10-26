export type merge<O> = { [K in keyof O]: O[K] };

namespace Functions {
	export type print<s extends string> = `print ${s}`;
}

type s = Functions.print<"hello">;

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

type parseCall<str extends string> = parseTag<
	trimWhitespace<str>,
	"call"
> extends [
	infer content extends string,
	infer rest extends string,
]
	? parseTag<content, "fn"> extends [
			infer fn extends string,
			infer fnRest extends string,
		]
		? [fn, fnRest]
		: never
	: never;

type callResult = parseCall<`
	<call>
		<fn>print</fn>
		<arg>foo</arg>
		<arg>bar</arg>
	</call>
`>;

type parseLet<str extends string> = parseTag<
	trimWhitespace<str>,
	"let"
> extends [infer content extends string, infer _]
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
				? [[name, type, value], valueRest]
				: never
			: never
		: never
	: never;

type result = parseLet<`
	<let>
		<name>foo</name>
		<type>number</type>
		<value>42</value>
	</let>
`>;

type parseManyLets<
	str extends string,
	acc extends [string, "number" | "string", string][],
> = str extends ""
	? acc
	: parseLet<str> extends [
				[
					infer name extends string,
					infer type extends "number" | "string",
					infer value extends string,
				],
				infer rest extends string,
			]
		? parseManyLets<rest, [...acc, [name, type, value]]>
		: never;
