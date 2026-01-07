import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { teamName, answers } = req.body;
  const userEmail = session.user.email.toLowerCase().trim();

  try {
    const sheets = await getSheetsClient();

    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:P', // Extended to column N for answers
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return res.status(404).json({ success: false, message: 'Sheet data not found' });
    }

    const dataRows = rows.slice(1);

    // Find team's first row
    let teamFirstRowIndex = -1;
    for (let i = 0; i < dataRows.length; i++) {
      if (dataRows[i][0] === teamName) {
        teamFirstRowIndex = i + 2;
        break;
      }
    }

    if (teamFirstRowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Update status to "Completed" and save answers
    // Columns: I=Q1, J=Q2, K=Q3, L=Q4, M=Q5, N=Q6, O=Q7
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Sheet1!I${teamFirstRowIndex}:P${teamFirstRowIndex}`,
valueInputOption: 'USER_ENTERED',
requestBody: {
  values: [[
    'Completed',
    answers.q1 || '',
    answers.q2 || '',
    answers.q3 || '',
    answers.q4 || '',
    answers.q5 || '',
    answers.q6 || '',
    answers.q7 || ''
  ]],
},
    });

    return res.status(200).json({
      success: true,
      message: 'Answers submitted successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit answers',
      details: error.message
    });
  }
}
