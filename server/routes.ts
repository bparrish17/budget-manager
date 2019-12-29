export const router = require('express').Router()
const formidable = require('formidable');
import { SheetsHelper } from './sheets';
import { mapTransactions, sortByDate, convertFileDataToJSON, convertCSVtoJSON } from './data';
import * as moment from 'moment';
import { resolve } from 'dns';


// additions

router.post('/updateSpreadsheet', (req, res) => {
	console.log('updating...');
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();

	form.multiples = true;
	form.parse(req);

	const sheetsHelper = new SheetsHelper(accessToken);
	let requests = [];

	form.on('file', (name, file) => {
		const noheader = name === 'usaa' ? true : false;
		requests.push(convertFileDataToJSON(name, file, noheader));
	});

	form.on('end', () => {
		let result = [];
		Promise.all(requests).then((fileData) => {
			fileData.forEach((data) => {
				if (data.length) {
					result = [...result, ...data].filter((val) => !!val);
				}
			});

			sheetsHelper.appendValues(result)
				.then((spreadsheetVals) => {
					if (spreadsheetVals) {
						res.send('Successfully Added Transactions!')
					}
				})
				.catch((err) => res.send('ERROR UPDATING SPREADSHEET VALS', err))
		})
	})
})

router.post('/createSpreadsheet', (req, res) => {
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();
	let startDate;
	let endDate;
	let startMYY;
	let endMYY;
	let sheetName = 'Budget';
	
	form.multiples = true;
	form.parse(req);

	form.on('field', (name, value) => {
		if (name === 'startDate') {
			startDate = value;
			startMYY = moment(startDate).format('M/YY');
			sheetName += ` (${startMYY}`;
		}
		if (name === 'endDate') {
			endDate = value;
			endMYY = moment(endDate).format('M/YY');
			sheetName += ` - ${endMYY})`
		}
	})

	const sheetsHelper = new SheetsHelper(accessToken);

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
					result = [...result, ...data].filter((val) => !!val);
				}
			});

			// result = sortByDate(result);

			sheetsHelper.updateSpreadsheet(sheetName)
				.then(() => sheetsHelper.updateSpreadsheetValues(result))
				.then((spreadsheetVals) => res.send(spreadsheetVals))
				.catch((err) => {
					res.send('ERROR UPDATING SPREADSHEET VALS', err);
				})
		}).catch((err) => {
			res.send('ERROR AT CONVERSION PROMISE', err);
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
