import React from 'react';
import { toast } from 'react-toastify';

const CustomToast = ({ content }) => {
  return (
    <div>
      <span style={{ marginRight: '8px' }}>{content}</span>
      <button onClick={() => toast.dismiss()}>OK</button>
    </div>
  );
};

export default CustomToast;
