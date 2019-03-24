const router = require('express').Router()
const formidable = require('formidable');
const SheetsHelper = require('./sheets');
const { convertCSVtoJSON, mapExpenses } = require('./data')
const _ = require('lodash');
const fs = require('fs');
const csv = require('csvtojson');

// additions

router.post('/createSpreadsheet', (req, res) => {
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();
	form.parse(req);

	form.on('file', (name, file) => {
		convertCSVtoJSON(file.path).then((jsonData) => {
			const expenses = mapExpenses(jsonData);
			res.send(expenses);
		})
	});

	// const sheetsHelper = new SheetsHelper(accessToken);
	// readCsvFile(file).then((csvData) => {
	// 	console.log('csv data', csvData);
	// 	res.send('success');
	// }).catch((err) => res.error(err));

	// sheetsHelper.createSpreadsheet(title, () => {
	// 	res.send(`Spreadsheet "${title}" Created`);
	// })
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
  error.status = 404
  next(error)
})

module.exports = router


		// const stream = fs.createReadStream(file.path);
		// const fileData = [];
		// stream.on('data', (chunk) => {
		// 	fileData.push(chunk);
		// })

		// stream.on('end', () => {
		// 	res.send(fileData);
		// })