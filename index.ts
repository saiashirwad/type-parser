type Parse<JSON extends string> = ParseValue<
	TrimLeft<JSON>
> extends [infer Parsed, infer Tail extends string]
	? [Parsed] extends [never]
		? never
		: TrimLeft<Tail> extends ""
			? Parsed
			: never
	: never;

type TrimLeft<JSON extends string> =
	JSON extends `${"" | "\n" | "\t"}${infer R}`
		? TrimLeft<R>
		: JSON;

type ParseValue<JSON extends string> =
	JSON extends `undefined${infer R}`
		? [undefined, TrimLeft<R>]
		: JSON extends `null${infer R}`
			? [null, TrimLeft<R>]
			: JSON extends `true${infer R}`
				? [true, TrimLeft<R>]
				: JSON extends `false${infer R}`
					? [false, TrimLeft<R>]
					: JSON extends `"${infer Str}"${infer R}`
						? [ParseString<Str>, TrimLeft<R>]
						: JSON extends `[${infer R}`
							? TrimLeft<R> extends `]${infer R}`
								? [[], TrimLeft<R>]
								: ParseArray<`,${TrimLeft<R>}`>
							: JSON extends `{${infer R}`
								? TrimLeft<R> extends `}${infer R}`
									? [{}, TrimLeft<R>]
									: ParseObject<`,${TrimLeft<R>}`>
								: never;

type ParseString<S extends string> =
	S extends `${infer L}\\${infer C extends keyof EscChars}${infer R}`
		? ParseString<`${L}${EscChars[C]}${R}`>
		: S;

type EscChars = {
	n: "\n";
	t: "\t";
	r: "\r";
	b: "\b";
	f: "\f";
};

type ParseArray<
	JSON extends string,
	Arr extends any[] = [],
> = JSON extends `]${infer R}`
	? [Arr, TrimLeft<R>]
	: JSON extends `,${infer R}`
		? ParseValue<TrimLeft<R>> extends [
				infer Value,
				infer R extends string,
			]
			? [Value] extends [never]
				? never
				: ParseArray<TrimLeft<R>, [...Arr, Value]>
			: never
		: never;

type ParseObject<
	JSON extends string,
	Obj extends object = {},
> = JSON extends `}${infer R}`
	? [Merge<Obj>, TrimLeft<R>]
	: JSON extends `,${infer R}`
		? ParseKey<TrimLeft<R>> extends [
				infer Key extends string,
				infer R,
			]
			? R extends `:${infer R}`
				? ParseValue<TrimLeft<R>> extends [
						infer Value,
						infer R extends string,
					]
					? ParseObject<
							TrimLeft<R>,
							Obj & { [K in Key]: Value }
						>
					: never
				: never
			: never
		: never;

type ParseKey<JSON extends string> =
	JSON extends `"${infer Key}"${infer R}`
		? [ParseString<Key>, TrimLeft<R>]
		: never;

type Merge<O> = { [K in keyof O]: O[K] };
