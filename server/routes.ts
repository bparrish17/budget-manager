export const router = require('express').Router()
const formidable = require('formidable');
import { SheetsHelper } from './sheets';
import { convertCSVtoJSON, mapTransactions, sortByDate } from './data';


// additions

router.post('/createSpreadsheet', (req, res) => {
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();
	let startDate;
	let endDate;
	
	form.multiples = true;
	form.parse(req);

	form.on('field', (name, value) => {
		if (name === 'startDate') startDate = value;
		if (name === 'endDate') endDate = value;
	})

	let requests = [];
	form.on('file', (name, file) => {
		const noheader = name === 'usaa' ? true : false;
		requests.push(
			convertCSVtoJSON(file.path, noheader).then((jsonData) => mapTransactions(name, startDate, endDate, jsonData))
		);
	});

	form.on('end', () => {
		let result = [];
		Promise.all(requests).then((fileData) => {
			fileData.forEach((data) => {
				if (data.length) {
					result = [...result, ...data];
				}
			});

			result = sortByDate(result);

			// create sheets here
			let sheetsHelper = new SheetsHelper(accessToken);
			sheetsHelper.updateSpreadsheet(`Budget`, (spreadsheetRes) => {
				console.log('res: ', spreadsheetRes);
				res.send(spreadsheetRes);
			})

			// sheetsHelper.getSpreadsheet((spreadsheetRes) => {
			// 	console.log('res: ', spreadsheetRes);
			// 	res.send(spreadsheetRes);
			// })
		})
	})
})

router.get('/auth', (req, res) => {
	res.send(req.session);
})

router.post('/auth', (req, res) => {
	req.session.data = req.body;
	res.send(req.session.data);
})

router.use((req, res, next) => {
  const error = new Error('Not Found')
  next(error)
})