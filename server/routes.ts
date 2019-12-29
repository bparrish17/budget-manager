export const router = require('express').Router()
const formidable = require('formidable');
import { SheetsHelper } from './sheets';
import { convertFileDataToJSON } from './data';


router.post('/updateSpreadsheet', (req, res) => {
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();

	form.multiples = true;
	form.parse(req);

	const sheetsHelper = new SheetsHelper(accessToken);
	let conversionRequests = [];

	form.on('file', (name, file) => {
		const noheader = name === 'usaa' ? true : false;
		conversionRequests.push(convertFileDataToJSON(name, file, noheader));
	});

	form.on('end', () => {
		let result = [];
		Promise.all(conversionRequests).then((fileData) => {
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
