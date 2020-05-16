import { object, string,  required, number, array, item, less, max, mismatch, min, pattern, any, union, prop, build, boolean, val, more } from "./index.js";

let detail = object(
	prop('id', required()),
	prop('value', union(string(), number())),
);

let detailList = array(
	item(required(detail)),
	min(1)
);

let schema = object(
	prop('name', required(string(any(val('thor'), val('qinnuo'))))),
	prop('account', required(union(string(), number()))),
	prop('age', required(number(any(less(5), more(20))))),
	prop('saved', required(boolean(val(true)))),
	prop('info', detailList)
);

console.log(JSON.stringify(schema));

try {

	let validate = build(schema);

	validate({
		name: 'qinnuo',
		account: 'aaa',
		info: [{id: 1, value: 3}],
		age: 4,
		saved: true
	});

} catch (e) {
	console.error(e);
}



//console.log(JSON.stringify(schema, null, 2));
