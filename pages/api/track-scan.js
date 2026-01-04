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

// Convert UTC Date to IST and format
function formatToIST(utcDate) {
  // Add IST offset (5 hours 30 minutes)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffset);
  
  const day = istDate.getUTCDate();
  const getDaySuffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();
  
  return `${hour12}:${minuteStr} ${ampm}, ${day}${getDaySuffix(day)} ${month} ${year}`;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }


  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }


  const { scanTimestamp } = req.body;
  const userEmail = session.user.email.toLowerCase().trim();


  try {
    const sheets = await getSheetsClient();


    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:H',
    });


    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return res.status(404).json({ 
        success: false, 
        message: 'No teams found in sheet' 
      });
    }


    const headers = rows[0];
    const dataRows = rows.slice(1);


    // Find user by email in column D (Candidate's Email)
    let userRowIndex = -1;
    let userRow = null;
    let teamName = null;


    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const email = row[3]; // Column D (index 3)
      
      if (email && email.toLowerCase().trim() === userEmail) {
        userRow = row;
        userRowIndex = i + 2;
        teamName = row[0]; // Column A - Team Name
        break;
      }
    }


    if (!userRow) {
      return res.status(404).json({
        success: false,
        message: 'Your email is not registered in any team. Please contact organizers.'
      });
    }


    // Find the first row of this team
    let teamFirstRowIndex = -1;
    for (let i = 0; i < dataRows.length; i++) {
      if (dataRows[i][0] === teamName) {
        teamFirstRowIndex = i + 2;
        break;
      }
    }


    const teamFirstRow = dataRows[teamFirstRowIndex - 2];
    const existingStartTime = teamFirstRow[4]; // Column E
    const existingEndTime = teamFirstRow[5];   // Column F
    const existingFirstScanner = teamFirstRow[6]; // Column G


    // Check if timer already started
    if (existingStartTime && existingEndTime) {
      return res.status(200).json({
        success: true,
        alreadyStarted: true,
        teamName,
        startTime: existingStartTime,
        endTime: existingEndTime,
        firstScanner: existingFirstScanner,
        currentScanner: userEmail,
        scanTimestamp,
      });
    }


    // First scan - start the 24-hour timer
    const startTime = new Date(scanTimestamp);
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);

    // Format timestamps to readable IST format
    const startTimeFormatted = formatToIST(startTime);
    const endTimeFormatted = formatToIST(endTime);


    // Update the first row of the team with timer data
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Sheet1!E${teamFirstRowIndex}:H${teamFirstRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          startTimeFormatted,
          endTimeFormatted,
          userEmail,
          'Active'
        ]],
      },
    });


    return res.status(200).json({
      success: true,
      alreadyStarted: false,
      teamName,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      firstScanner: userEmail,
      currentScanner: userEmail,
      scanTimestamp,
    });


  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process scan',
      details: error.message
    });
  }
}
