const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const util = require('util');

export class SheetsHelper {
  public service: any;

  constructor(accessToken) {
    const auth = new OAuth2Client();
    auth.credentials = { access_token: accessToken };
    this.service = google.sheets({version: 'v4', auth });
  }

  createSpreadsheet(title, callback) {
    const request = {
      resource: {
        properties: {
          title: title
        },
        sheets: [
          {
            properties: {
              title: 'Data',
              gridProperties: {
                columnCount: 6,
                frozenRowCount: 1
              }
            }
          },
          // TODO: Add more sheets.
        ]
      }
    };
    this.service.spreadsheets.create(request, (err, res) => {
      if (err) {
        return callback(err);
      }
      var spreadsheet = res.data;
      // TODO: Add header rows.
      return callback(null, spreadsheet);
    })
  }

}