export type trimLeft<str extends string> =
	str extends `${" " | "\n" | "\t"}${infer rest}`
		? trimLeft<rest>
		: str;

export type merge<O> = { [K in keyof O]: O[K] };

type Escape = {
	n: "\n";
	t: "\t";
	r: "\r";
	b: "\b";
	f: "\f";
};

type parseString<str extends string> =
	str extends `${infer left}\\${infer c extends keyof Escape}${infer right}`
		? parseString<`${left}${Escape[c]}${right}`>
		: str;

type parseTag<
	str extends string,
	tag extends string,
> = str extends `<${tag}>${infer content}</${tag}>${infer rest}`
	? [content, rest]
	: never;

type parsePAndAInsideDiv<str extends string> = parseTag<
	str,
	"div"
> extends [infer content extends string, infer rest]
	? parseTag<content, "p"> extends [
			infer pContent extends string,
			infer rest extends string,
		]
		? parseTag<rest, "a"> extends [
				infer aContent,
				infer rest,
			]
			? [{ a: aContent; p: pContent }, rest]
			: never
		: never
	: never;

type result = parsePAndAInsideDiv<`
	<div><p>hello there!</p><a>hi</a></div>
	`>;
