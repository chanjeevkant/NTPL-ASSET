const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const docxConverter = require('docx-pdf');
const officegen = require('officegen');
const { PassThrough } = require('stream');
const { createReport } = require('docx-templates');
const { Console } = require('console');
const app = express();
const port = 5000;

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

const config = {
  user: 'sa',
  password: 'ntpl123',
  server: '172.16.250.253', 
  database: 'IT_Asset_management',
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  }
};

// Connect to MSSQL
sql.connect(config, err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('MSSQL Connected...');
});

app.get('/api/columns', async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'asset_details'
    `);
    const columns = result.recordset.map(row => row.COLUMN_NAME);
    res.json(columns);
  } catch (err) {
    console.error('Error fetching columns:', err);
    res.status(500).json({ error: 'Error fetching columns' });
  }
});

app.get('/api/data', async (req, res) => {
  const cpf = req.query.cpf; // Retrieve CPF from query parameters

  try {
    if (!cpf) {
      return res.status(400).json({ error: 'CPF parameter is required' });
    }

    const request = new sql.Request();

    request.input('cpf', sql.VarChar, cpf);

    const query = `
      SELECT NAME,DIVISION,[PC ID],[USER NAME],[IP DETAILS],[MAC ADDRESS],[PROCESSOR TYPE],[WINDOWS OS VERSION],[MS OFFICE],[UPS]
      FROM asset_details 
      WHERE [CPF NO] = @cpf
    `;
    const result = await request.query(query);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }
  
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/api/assets', async (req, res) => {
   try {
    const request = new sql.Request();
    
    const query = `
      SELECT *
      FROM asset_details 
    `;
    const result = await request.query(query);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/api/assetDropdown', async (req, res) => {
  try {
   const request = new sql.Request();
   const cpf = req.query.cpf;

   request.input('cpf', sql.VarChar, cpf);
   
   const query = `
     SELECT [CPU BRAND DETAILS],[MONITOR SIZE],[PROCESSOR TYPE],[UPS],[PRINTER MODEL]
     FROM asset_details WHERE [CPF NO] = @cpf 
   `;
   const result = await request.query(query);
   if (result.recordset.length === 0) {
     return res.status(404).json({ error: 'No data found' });
   }
   res.json(result.recordset);
 } catch (err) {
   console.error('Error fetching data:', err);
   res.status(500).json({ error: 'Error fetching data' });
 }
});

app.get('/api/pendingRequests', async (req, res) => {
  try {
   const request = new sql.Request();
   const cpf = req.query.cpf;

   request.input('cpf', sql.VarChar, cpf);
   
   const query = `
     SELECT *
     FROM IT_Surrender WHERE [CPF] = @cpf AND [Status]= 'In Process'
   `;
   const result = await request.query(query,cpf);
   if (result.recordset.length == 0) {
     return res.status(404).json({ error: 'No data found' });
   }
   res.json(result.recordset);
   

  }
  catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Error fetching data' });
  }
  });

  app.get('/api/freeAssetList', async (req, res) => {
    try{
    const request = new sql.Request();
    const query = `
        SELECT DISTINCT * FROM [Free_Asset_List];
      `;
    const result = await request.query(query);
    if (result.recordset.length == 0) {
      return res.status(404).json({ error: 'No data found' });
    }
    res.json(result.recordset);
    }
    catch(err){
      console.error("Error:", err);
      res.status(500).json({ message: 'Server error', auth: '0' });
    }
  });

  app.get('/api/requestHistory', async (req, res) => {
    try {
     const request = new sql.Request();
     let query = ``;
     const cpf = req.query.cpf;
     if(cpf){
      request.input('cpf', sql.VarChar, cpf);
      query='SELECT *  FROM IT_Surrender WHERE [CPF] = @cpf';
     }else{
      query='SELECT *  FROM IT_Surrender';
     }
     const result = await request.query(query,cpf);
     if (result.recordset.length == 0) {
       return res.status(404).json({ error: 'No data found' });
     }
     res.json(result.recordset);
    }
    catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    }
    });

app.post('/api/update', async (req, res) => {
  const updates = req.body.updateComponents;
  const cpf = updates.cpf;
  const updateColumn = updates.columnName.replace(/\s+$/, '');
  const updateddata = (updates.setValue);
  
  
  if (!cpf || !updates) {
    return res.status(400).json({ error: 'CPF and updates are required' });
  }

  try {
    // Create a new request object
    const request = new sql.Request();
    request.input('cpf', sql.VarChar, cpf);
    request.input('updatedValue', sql.VarChar, updateddata);
    
    const query = `
      UPDATE asset_details
      SET ${updateColumn} = @updatedValue
      WHERE [CPF NO] = @cpf
    `;
    const result = await request.query(query);
    console.log('Data updated successfully');
    res.json({ message: 'Data updated successfully', affectedRows: result.rowsAffected });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Error updating data' });
  }
});

app.post('/api/assetSurrender', async (req, res) => {
  const details = req.body.surrenderEntries;
  const name = details.name;
  const cpf = details.cpf;
  const designation = details.designation;
  const assets = details.assets.join(',');
  const remarks = details.surrenderRemarks;

  if (!cpf || !details) {
    return res.status(400).json({ error: 'CPF and updates are required' });
  }

  try {
    const request = new sql.Request();
    request.input('cpf', sql.VarChar, cpf);
    request.input('name', sql.VarChar, name);
    request.input('designation', sql.VarChar, designation);
    request.input('assets', sql.VarChar, assets);
    request.input('remarks', sql.VarChar, remarks);
    
    const query = `
     INSERT INTO IT_Surrender ([Name], [CPF], [Designation], [Assets], [Remarks])
     VALUES(@name,@cpf,@designation,@assets,'remarks')
    `;
    const result = await request.query(query);
    console.log('Data Inserted successfully');
    res.json({ message: 'Data Inserted successfully', affectedRows: result.rowsAffected });
  } catch (err) {
    console.error('Error Inserted data:', err);
    res.status(500).json({ error: 'Error Inserted data' });
  }
});

app.post('/api/acceptSurrender', async (req, res) => {
  try{
    const request = new sql.Request();
    const details = req.body.surrenderAsset;
    const cpf = details.cpf;
    let assets = details.assets;
    request.input('cpf', sql.VarChar, cpf);
    let query = `
      SELECT [PC ID],	[USER NAME],[IP DETAILS],[MAC ADDRESS],[MONITOR SIZE],[PROCESSOR TYPE],[RAM],[HDD SPEC],[CPU BRAND DETAILS],[WINDOWS OS VERSION],[WINDOWS OS VERSION_(ORIGINAL / PIRATE )],[MS OFFICE]
      FROM asset_details WHERE [CPF NO] = @cpf
    `;

    let data = await request.query(query);
    if (data.recordset.length === 0) {
      return res.status(404).json({ error: 'No assets found for the given CPF.' });
    }

    const insertPromises = data.recordset.map(asset => {
      const insertRequest = new sql.Request(); 

      const insertQuery = `
        INSERT INTO [IT_Asset_management].[dbo].[Free_Asset_List] 
        ([PC ID], [USER NAME], [IP DETAILS], [MAC ADDRESS], [MONITOR SIZE],
         [PROCESSOR TYPE], [RAM], [HDD SPEC], [CPU BRAND DETAILS],
         [WINDOWS OS VERSION], [ORIGINAL/PIRATED], [MS OFFICE])
        VALUES (@pcId, @userName, @ipDetails, @macAddress, @monitorSize,
                @processorType, @ram, @hddSpec, @cpuBrandDetails,
                @windowsOSVersion, @originalPirated, @msOffice)
      `;

      return insertRequest
        .input('pcId', sql.VarChar, asset['PC ID'])
        .input('userName', sql.VarChar, asset['USER NAME'])
        .input('ipDetails', sql.VarChar, asset['IP DETAILS'])
        .input('macAddress', sql.VarChar, asset['MAC ADDRESS'])
        .input('monitorSize', sql.VarChar, asset['MONITOR SIZE'])
        .input('processorType', sql.VarChar, asset['PROCESSOR TYPE'])
        .input('ram', sql.VarChar, asset['RAM'])
        .input('hddSpec', sql.VarChar, asset['HDD SPEC'])
        .input('cpuBrandDetails', sql.VarChar, asset['CPU BRAND DETAILS'])
        .input('windowsOSVersion', sql.VarChar, asset['WINDOWS OS VERSION'])
        .input('originalPirated', sql.VarChar, asset['WINDOWS OS VERSION_(ORIGINAL / PIRATE )'])
        .input('msOffice', sql.VarChar, asset['MS OFFICE'])
        .query(insertQuery);
    });

    await Promise.all(insertPromises);

    let updateQuery = `
    UPDATE asset_details
    SET [USER NAME] = NULL, 
        [IP DETAILS] = NULL, 
        [MAC ADDRESS] = NULL, 
        [MONITOR SIZE] = NULL, 
        [PROCESSOR TYPE] = NULL, 
        [RAM] = NULL, 
        [HDD SPEC] = NULL, 
        [CPU BRAND DETAILS] = NULL, 
        [WINDOWS OS VERSION] = NULL, 
        [WINDOWS OS VERSION_(ORIGINAL / PIRATE )] = NULL, 
        [MS OFFICE] = NULL 
    WHERE [CPF NO] = @cpf
  `;

    await request.query(updateQuery);

    updateQuery = `
    UPDATE [IT_Surrender] 
    SET [Status] ='Accepted'
    WHERE [CPF] = @cpf
  `;

  await request.query(updateQuery);

    console.log("Asset Surrender Successfull and cleared the entries in assets table");
    return res.status(200).json({ message: 'Assets successfully accepted.' });

  }
  catch(err){
    console.error('Error Surrendering data:', err);
    res.status(500).json({ error: 'Error Surrendering data' });
  }
});

app.post('/api/revertSurrender', async (req, res) => {
  try{
    const request = new sql.Request();
    const details = req.body.revertAsset;
    const cpf = details.cpf;
    request.input('cpf', sql.VarChar, cpf);
   
            
    updateQuery = `
    UPDATE [IT_Surrender] 
    SET [Status] ='Reverted'
    WHERE [CPF] = @cpf
  `;

  await request.query(updateQuery);

    console.log("Asset reverted Successfull");
    return res.status(200).json({ message: 'Assets successfully accepted.' });

  }
  catch(err){
    console.error('Error Surrendering data:', err);
    res.status(500).json({ error: 'Error Surrendering data' });
  }
});

app.post('/api/authentication', async (req, res) => {
  const { client, credentials } = req.body;
  const { username, password } = credentials;
  if (!username || !password || !client) {
    return res.status(400).json({ message: 'Invalid input', auth: '0' });
  }

  const request = new sql.Request();
  request.input('username', sql.VarChar, username);
  let query;
  let result;

  try {
    if (client == 1) {
      query = 'SELECT password FROM usertable WHERE username = @username';
    } else {
      query = 'SELECT password FROM admintable WHERE username = @username';
    }

    result = await request.query(query);

    if (result.recordset.length > 0 && result.recordset[0].password.replace(/ /g, '') === password) {
      res.json({ message: 'Authentication Successful', auth: '1' });
    } else {
      res.json({ message: 'Authentication Failed', auth: '0' });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: 'Server error', auth: '0' });
  }
});

app.post('/api/accessories', async (req, res) => {
  try{
  const cpf = req.body.cpf;
  const request = new sql.Request();
  if(cpf){
  request.input('cpf', sql.VarChar, cpf);
  const query = `
      SELECT [PC ID],[MONITOR SIZE],[OTHER INSTALLED SOFTWARE DETAILS ]
      ,[WIRELESS MODEM],[UPS]
      ,[V/C SPEAKER]
      FROM asset_details WHERE [CPF NO] = @cpf
    `;

  const result = await request.query(query);
  console.log(result.recordset,cpf)
  if (result.recordset.length == 0) {
    return res.status(404).json({ error: 'No data found' });
  }
  res.json(result.recordset);
}
  }
  catch(err){
    console.error("Error:", err);
    res.status(500).json({ message: 'Server error', auth: '0' });
  }
});


app.post('/api/assetTransfer', async (req, res) => {
  try {
    const { name, designation, cpf, division, assets } = req.body;
    
    
    // Initialize asset details with 'Nil' for all optional fields
    const assetDetails = {
      'Pc Id':'Nil',
      'Monitor Size': 'Nil',
      'Processor Type': 'Nil',
      'CPU Brand Details': 'Nil',
      'UPS': 'Nil',
      'Printer Model': 'Nil',
      'IP Details': 'Nil',
      'MAC Address': 'Nil',
      'HDD Spec': 'Nil',
      'RAM': 'Nil',
      'Windows OS Version': 'Nil',
      'MS Office': 'Nil',
      'Other Installed Software Details': 'Nil',
      'Wireless Modem': 'Nil',
      'V/C Speaker': 'Nil',
      'F23': 'Nil',
      'F24': 'Nil',
    };

    console.log(assets);
    // Update asset details based on the provided assets
    if (assets && typeof assets === 'object') {
      assetDetails['Pc Id'] = assets['PC ID']|| assetDetails['Pc Id'];
      assetDetails['Monitor Size'] = assets.Monitor || assetDetails['Monitor Size'];
      assetDetails['Processor Type'] = assets.Processor || assetDetails['Processor Type'];
      assetDetails['CPU Brand Details'] = assets.CPU || assetDetails['CPU Brand Details'];
      assetDetails['CPU Brand Details'] = assets.Printer || assetDetails['CPU Brand Details'];
      assetDetails['CPU Brand Details'] = assets.UPS || assetDetails['CPU Brand Details'];
    }

    // Insert the data into the database
    const query = `
      INSERT INTO [dbo].[asset_details]
  ([PC ID],[NAME], [CPF NO], [DIVISION], [MONITOR SIZE], [PROCESSOR TYPE], 
         [CPU BRAND DETAILS], [UPS], [PRINTER MODEL], 
         [IP DETAILS], [MAC ADDRESS], [HDD SPEC], [RAM], 
         [WINDOWS OS VERSION], [MS OFFICE], 
         [OTHER INSTALLED SOFTWARE DETAILS], [WIRELESS MODEM], 
         [V/C SPEAKER], [F23], [F24])
      VALUES
        (@PC_ID,@NAME, @CPF_NO, @DIVISION, @MONITOR_SIZE, @PROCESSOR_TYPE, 
         @CPU_BRAND_DETAILS, @UPS, @PRINTER_MODEL, 
         @IP_DETAILS, @MAC_ADDRESS, @HDD_SPEC, @RAM, 
         @WINDOWS_OS_VERSION, @MS_OFFICE, 
         @OTHER_INSTALLED_SOFTWARE_DETAILS, @WIRELESS_MODEM, 
         @V_C_SPEAKER, @F23, @F24);
    `;

    const request = new sql.Request();
    request.input('PC_ID', sql.NVarChar(255), assetDetails['Pc Id']);
    request.input('NAME', sql.NVarChar(255), name);
    request.input('CPF_NO', sql.NVarChar(255), cpf);
    request.input('DIVISION', sql.NVarChar(255), division);
    request.input('MONITOR_SIZE', sql.NVarChar(255), assetDetails['Monitor Size']);
    request.input('PROCESSOR_TYPE', sql.NVarChar(255), assetDetails['Processor Type']);
    request.input('CPU_BRAND_DETAILS', sql.NVarChar(255), assetDetails['CPU Brand Details']);
    request.input('UPS', sql.NVarChar(255), assetDetails['UPS']);
    request.input('PRINTER_MODEL', sql.NVarChar(255), assetDetails['Printer Model']);
    request.input('IP_DETAILS', sql.NVarChar(255), assetDetails['IP Details']);
    request.input('MAC_ADDRESS', sql.NVarChar(255), assetDetails['MAC Address']);
    request.input('HDD_SPEC', sql.NVarChar(255), assetDetails['HDD Spec']);
    request.input('RAM', sql.NVarChar(255), assetDetails['RAM']);
    request.input('WINDOWS_OS_VERSION', sql.NVarChar(255), assetDetails['Windows OS Version']);
    request.input('MS_OFFICE', sql.NVarChar(255), assetDetails['MS Office']);
    request.input('OTHER_INSTALLED_SOFTWARE_DETAILS', sql.NVarChar(255), assetDetails['Other Installed Software Details']);
    request.input('WIRELESS_MODEM', sql.NVarChar(255), assetDetails['Wireless Modem']);
    request.input('V_C_SPEAKER', sql.NVarChar(255), assetDetails['V/C Speaker']);
    request.input('F23', sql.NVarChar(255), assetDetails['F23']);
    request.input('F24', sql.NVarChar(255), assetDetails['F24']);

    // Execute the insert query
    await request.query(query);
    console.log('Asset Details Transfered Succesfully');

    res.status(200).json({ message: 'Asset transfer details processed successfully' });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: 'Server error', auth: '0' });
  }
});


app.post('/api/ClearanceCertificate', async (req, res) => {
  const { date, name, cpf, designation, division } = req.body;

  // Define the template path
  const templatePath = path.join(__dirname, 'Templates', 'ClearanceCertificate.docx');
  const uploadsDir = path.join(__dirname, 'uploads');

  // Ensure the uploads directory exists
  await fs.ensureDir(uploadsDir);

  // Paths for modified documents
  const modifiedDocPath = path.join(uploadsDir, `ClearanceCertificate_${Date.now()}.docx`);
  const tempPdfPath = path.join(uploadsDir, `ClearanceCertificate_${Date.now()}.pdf`);

  try {
      // Load the existing template document
      const templateBuffer = fs.readFileSync(templatePath);
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, lineBreaks: true });

      // Populate the fields in the document
      doc.render({
          date, name, cpf, designation, division
      });

      // Generate the buffer for the modified document
      const outputBuffer = doc.getZip().generate({ type: 'nodebuffer' });

      // Write the modified document to a new file
      await fs.writeFile(modifiedDocPath, outputBuffer);

      // Convert the modified document to PDF
      docxConverter(modifiedDocPath, tempPdfPath, (err) => {
          if (err) {
              return res.status(500).send('Error converting document to PDF: ' + err.message);
          }
          res.set({
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename=ClearanceCertificate_${Date.now()}.pdf`,
          });

          res.download(tempPdfPath, (err) => {
              fs.unlink(modifiedDocPath, () => {});
              fs.unlink(tempPdfPath, () => {});
          });
      });
  } catch (error) {
      console.error('Error processing document:', error);
      res.status(500).send('Error processing document: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
