import React from 'react';

function SaveButton({ onSave }) {
  return (
    <button onClick={onSave}>Save</button>
  );
}

export default SaveButton;