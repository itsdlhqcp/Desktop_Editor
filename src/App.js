import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import RichTextEditor from './components/RichTextEditor';
import SaveButton from './components/SaveButton';
import CustomToast from './components/CustomToast';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    return savedContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      : EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const contentJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', contentJSON);
  }, [editorState]);

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', contentJSON);
    toast(<CustomToast content="Everything Auto-Saved !!" />, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <h4>Demo Editor by Dilhaque C P <SaveButton onSave={handleSave} /></h4>
      <div className="App">
        <RichTextEditor editorState={editorState} setEditorState={setEditorState} />
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
