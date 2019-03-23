const router = require('express').Router()
const SheetsHelper = require('./sheets');
module.exports = router

// additions

router.post('/createSpreadsheet', (req, res, next) => {
	const { title, accessToken } = req.body
	const sheetsHelper = new SheetsHelper(accessToken);
	console.log('Title', req.body);
	sheetsHelper.createSpreadsheet(title, (googleRes) => {
		console.log('created?', googleRes);
		res.send({ spreadsheet: "AHYYOIUs" });
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