import {
	Schema,
	end,
	object,
	string as str,
	required as req,
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
} from '../dist/index.js';

let detail = object(
	prop('id', req()),
	prop('value', union(date(any(before('2019-1-1'), after('2020-1-1'))), str(max(3))))
);

let detailList = array(item(req(detail)), min(1));

let rootRule = object(
	prop('name', req(str(any(equal('thor'), equal('qinnuo'), pattern(/^abc/))))),
	prop('account', req(union(str(), number()))),
	prop('age', req(number(more(20)))),
	prop('saved', req(boolean(equal(true)))),
	prop('borthday', req(date(end('2020-3-1')))),
	prop('info', detailList)
);

try {
	let schema = new Schema(rootRule);
	schema.validate({
		name: 'abcd',
		account: 'aaa',
		info: [{ id: 1, value: '2018-1-1' }],
		age: 22,
		borthday: '2020-2-1',
		saved: true,
	});
	console.log(schema + '');
	console.log('Validate success!');
} catch (e) {
	console.error(e.message);
}

//console.log(JSON.stringify(schema, null, 2));
