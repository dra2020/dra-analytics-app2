/* =============
  Root component
============= */

//React imports
import { useState } from 'react'

//Component imports
import AnalyticsViewSingle from './components/AnalyticsViewSingle'
import UploadView from './components/UploadView';
import ServerShutdownView from './components/ServerShutdownView';

//Helpers import
import * as Helpers from './lib/Helpers';

function App() {
  console.log('App component is rendering'); // Debugging log

  //State
  const [uploadedFile, setUploadedFile] = useState(null); //holds currently uploaded file
  const [scorecard, setScorecard] = useState(null); //holds result of profile scoring
  const [currView, setCurrView] = useState('UploadView'); //holds current view - UploadView || AnalyticsViewSingle
  const [uploadMessage, setUploadMessage] = useState(null); //holds upload view message

  /* ======
  HANDLERS
  ======= */

  //POST uploaded profile to server & receive scorecard as response
  async function fetchScorecard() {
    if (!uploadedFile) {
      setUploadMessage('Please upload a file first.');
      return;
    };
    try {
    const response = await fetch('/single', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadedFile),
    });
    const scorecard = await response.json();
    scorecard.profileName = uploadedFile.fileName; //associate scorecard with profile
    setScorecard(scorecard);
    setCurrView('AnalyticsViewSingle');
    console.log(scorecard); // Debugging log
    } catch (error) {
    console.error('Error fetching scorecard:', error);
    }
  };

  // Read uploaded file to state
  function uploadFile(file) {
    const reader = new FileReader();
    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onload = () => {
      try {
        const newFile = JSON.parse(reader.result); // Parse JSON from file
        if (Helpers.validateJson(newFile)) {
          newFile.fileName = Helpers.removeFileExtension(file[0].name); //returns file name without '.json'
          console.log(newFile);
          setUploadMessage(null); // Clear any previous upload message
          setUploadedFile(newFile); // Set uploadedFile with parsed JSON
        } else {
          setUploadedFile(null); // Reset uploadedFile if validation fails
          setUploadMessage('Invalid JSON structure. Please check the file format.');
        }
        
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file[0]); // Read file as text, file is passed as single element array
  }

  // Reset state and return to UploadView
  function resetUpload() {
    setCurrView('UploadView');
    setUploadedFile(null);
    setScorecard(null);
    setUploadMessage(null);
  }

  /* ======
  COMPONENT
  ======= */
  return (
    <>
        {currView === 'UploadView' && <UploadView uploadFile={uploadFile} fetchScorecard={fetchScorecard} uploadedFile={uploadedFile} uploadMessage={uploadMessage} setCurrView={setCurrView}/>}
        {currView === 'AnalyticsViewSingle' && <AnalyticsViewSingle profile={uploadedFile} scorecard={scorecard} resetUpload={resetUpload} setCurrView={setCurrView} />}
        {currView === 'ServerShutdown' && <ServerShutdownView />}
    </>
  )
}

export default App
