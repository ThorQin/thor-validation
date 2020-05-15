import { object, string,  required, number, array, item, max, mismatch, min, pattern, any, union, prop, buildSchema } from "./index.js";

let detail = object(
	prop('id', string(), required()),
	prop('value', number(), required()),
);

let detailList = array(
	item(detail, required()),
	max(1000),
	required(),
	mismatch('must be an array')
);

try {

	let schema = buildSchema(object(
		prop('name', string(min(10), pattern(/^abc/)), required('must provide name!')),
		prop('account', string()),
		prop('age',
			union(
				number(min(0), max(100)),
				string()
			), required()),
		prop('info', detailList),
		required('must be an object!')
	));

	schema({
		name: 'abcqinnuo thor'
	});

} catch (e) {
	console.error(e);
}



//console.log(JSON.stringify(schema, null, 2));
