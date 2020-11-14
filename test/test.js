const {
	Schema,
	end,
	object,
	string,
	need,
	number,
	array,
	item,
	less,
	max,
	mismatch,
	min,
	pattern,
	any,
	union,
	prop,
	boolean,
	equal,
	more,
	date,
	before,
	after,
} = require('../dist/index.js');

let detail = object(
	prop('id', need(string(mismatch('must be a string')))),
	prop('value', union(date(any(before('2019-1-1'), after('2020-1-1'))), string(max(3))))
);

let detailList = array(item(need(detail)), min(1));

let rootRule = object(
	prop('name', need(string(any(equal('thor'), equal('qinnuo'), pattern(/^abc/))))),
	prop('account', need(union(string(), number()))),
	prop('age', need(number(more(20, 'should more than 20'), less(30, 'should less then 30')))),
	prop('saved', need(boolean(equal(true)))),
	prop('borthday', need(date(end('2020-3-1')))),
	prop('info', detailList)
);

try {
	let schema = new Schema(rootRule);
	schema.validate({
		name: 'abcd',
		account: '1110',
		info: [{ id: '1', value: '2018-1-1' }],
		age: 29,
		borthday: '2020-2-1',
		saved: true,
	});
	console.log(schema + '');
	console.log('Validate success!');
} catch (e) {
	console.error(e.message);
}

//console.log(JSON.stringify(schema, null, 2));
