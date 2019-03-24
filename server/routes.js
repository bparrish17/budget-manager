const router = require('express').Router()
const formidable = require('formidable');
const SheetsHelper = require('./sheets');
const { convertCSVtoJSON, mapTransactions } = require('./data')
const _ = require('lodash');
const fs = require('fs');
const csv = require('csvtojson');

// additions

router.post('/createSpreadsheet', (req, res) => {
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();
	
	form.multiples = true;
	form.parse(req);

	let requests = [];
	form.on('file', (name, file) => {
		const noheader = name === 'usaa' ? true : false;
		requests.push(
			convertCSVtoJSON(file.path, noheader).then((jsonData) => mapTransactions(name, jsonData))
		);
	});

	form.on('end', () => {
		let result = [];
		Promise.all(requests).then((fileData) => {
			fileData.forEach((data) => {
				if (data.length) result.push(data)
			});
			res.send(result);
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
  error.status = 404
  next(error)
})

module.exports = router