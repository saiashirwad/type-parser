type trimLeft<json extends string> =
	json extends `${" " | "\n" | "\t"}${infer rest}`
		? trimLeft<rest>
		: json;

type Merge<O> = { [K in keyof O]: O[K] };

type result = trimLeft<"\t   \n\nhi there">;

type parseKey<json extends string> = json extends `"a"`
	? _
	: _;
