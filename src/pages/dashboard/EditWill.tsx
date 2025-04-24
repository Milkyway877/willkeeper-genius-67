
import React from 'react';
import { useParams } from 'react-router-dom';

const EditWill: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>Edit Will</h2>
      <p>Edit will with ID: {id}</p>
    </div>
  );
};

export default EditWill;
