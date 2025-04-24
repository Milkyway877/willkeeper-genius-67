
import React from 'react';
import { useParams } from 'react-router-dom';

const EditMessage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>Edit Message</h2>
      <p>Edit message with ID: {id}</p>
    </div>
  );
};

export default EditMessage;
